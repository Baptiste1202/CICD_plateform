import express from "express";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { verifyToken } from "../middlewares/verifyToken.js";
import { io } from "../sockets/socket.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const deployRoutes = express.Router();

function runCommand(command: string, args: string[], cwd: string, callback: (error?: any) => void) {
  io?.emit('deploy-log', `> [${path.basename(cwd)}] ${command} ${args.join(' ')}\n`);

  const child = spawn(command, args, { cwd, shell: true });

  child.stdout.on('data', (data) => io?.emit('deploy-log', data.toString()));
  child.stderr.on('data', (data) => io?.emit('deploy-log', `LOG: ${data.toString()}`));

  child.on('close', (code) => {
    if (code !== 0) {
      callback(new Error(`La commande a échoué avec le code ${code}`));
    } else {
      callback();
    }
  });
}

function transferDockerImageViaSSH(params: { image: string; sshTarget: string; useSudo?: boolean; cwd: string; sshPassword?: string; sudoPassword?: string }, callback: (error?: any) => void) {
  const { image, sshTarget, useSudo = false, cwd, sshPassword, sudoPassword } = params;

  io?.emit('deploy-log', `> [${path.basename(cwd)}] docker save ${image} | ssh ${sshTarget} "${useSudo ? 'sudo ' : ''}docker load"\n`);

  const saveProc = spawn("docker", ["save", image], { cwd, shell: false });
  const remoteCmd = `${useSudo ? 'sudo -S ' : ''}docker load`;

  // Utiliser ssh standard (OpenSSH inclus dans Windows 10/11)
  // Note: nécessite une configuration de clé SSH pour authentification automatique
  const sshProc = spawn("ssh", ["-C", "-o", "StrictHostKeyChecking=no", sshTarget, remoteCmd], { cwd, shell: false });

  // Si sudo requiert un mot de passe, l'envoyer avant le flux de l'image
  if (useSudo && sudoPassword) {
    try {
      sshProc.stdin.write(`${sudoPassword}\n`);
    } catch (e) {
      io?.emit('deploy-log', `LOG: Erreur lors de l'envoi du mot de passe sudo: ${e}\n`);
    }
  }

  // Stream de l'image Docker vers docker load distant
  saveProc.stdout.pipe(sshProc.stdin);

  // Forward logs
  saveProc.stderr.on('data', (d) => io?.emit('deploy-log', `LOG[docker save]: ${d.toString()}`));
  sshProc.stdout.on('data', (d) => io?.emit('deploy-log', d.toString()));
  sshProc.stderr.on('data', (d) => io?.emit('deploy-log', `LOG[ssh]: ${d.toString()}`));

  let finished = false;
  const TRANSFER_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
  const timeout = setTimeout(() => {
    io?.emit('deploy-log', `❌ Transfert expiré après ${Math.round(TRANSFER_TIMEOUT_MS/60000)} min.\n`);
    finalize(new Error('Transfert de l\'image expiré'));
  }, TRANSFER_TIMEOUT_MS);

  const finalize = (err?: any) => {
    if (finished) return;
    finished = true;
    clearTimeout(timeout);
    try { saveProc.kill(); } catch {}
    try { sshProc.kill(); } catch {}
    callback(err);
  };

  saveProc.on('error', (e) => finalize(new Error(`docker save a échoué: ${e.message}`)));
  sshProc.on('error', (e) => finalize(new Error(`ssh a échoué: ${e.message}`)));

  sshProc.on('close', (code) => {
    if (code !== 0) {
      finalize(new Error(`ssh s'est terminé avec le code ${code}`));
    } else {
      io?.emit('deploy-log', `✅ Image transférée et chargée sur ${sshTarget}.\n`);
      finalize();
    }
  });

  // Si docker save se termine avant ssh, on attend la fin de ssh.
  saveProc.on('close', (code) => {
    if (code !== 0) {
      finalize(new Error(`docker save s'est terminé avec le code ${code}`));
    }
  });
}

function executeRemoteCommand(params: { sshTarget: string; command: string; cwd: string; sshPassword?: string }, callback: (error?: any) => void) {
  const { sshTarget, command, cwd, sshPassword } = params;

  io?.emit('deploy-log', `> [remote] ssh ${sshTarget} "${command}"\n`);

  const sshProc = spawn("ssh", ["-o", "StrictHostKeyChecking=no", sshTarget, command], { cwd, shell: false });

  sshProc.stdout.on('data', (d) => io?.emit('deploy-log', d.toString()));
  sshProc.stderr.on('data', (d) => io?.emit('deploy-log', `LOG[ssh]: ${d.toString()}`));

  sshProc.on('close', (code) => {
    if (code !== 0) {
      callback(new Error(`La commande distante a échoué avec le code ${code}`));
    } else {
      io?.emit('deploy-log', `✅ Commande distante exécutée avec succès.\n`);
      callback();
    }
  });

  sshProc.on('error', (e) => callback(new Error(`ssh a échoué: ${e.message}`)));
}

function copyFileToRemote(params: { sshTarget: string; localFile: string; remotePath: string; cwd: string; sshPassword?: string }, callback: (error?: any) => void) {
  const { sshTarget, localFile, remotePath, cwd, sshPassword } = params;

  io?.emit('deploy-log', `> [scp] ${path.basename(localFile)} → ${sshTarget}:${remotePath}\n`);

  const scpProc = spawn("scp", ["-o", "StrictHostKeyChecking=no", localFile, `${sshTarget}:${remotePath}`], { cwd, shell: false });

  scpProc.stdout.on('data', (d) => io?.emit('deploy-log', d.toString()));
  scpProc.stderr.on('data', (d) => io?.emit('deploy-log', `LOG[scp]: ${d.toString()}`));

  scpProc.on('close', (code) => {
    if (code !== 0) {
      callback(new Error(`Le transfert du fichier a échoué avec le code ${code}`));
    } else {
      io?.emit('deploy-log', `✅ Fichier transféré avec succès.\n`);
      callback();
    }
  });

  scpProc.on('error', (e) => callback(new Error(`scp a échoué: ${e.message}`)));
}

deployRoutes.post("/", verifyToken({ role: "admin" }), (req, res) => {
  const appMetierRoot = path.resolve(__dirname, "../../../../Application_metier");
  const cicdRunDir = path.join(appMetierRoot, "CICD-run");
  const sshPassword = (req.body?.sshPassword as string) || process.env.DEPLOY_SSH_PASSWORD || undefined;
  const sudoPassword = (req.body?.sudoPassword as string) || process.env.DEPLOY_SUDO_PASSWORD || undefined;
  const userVM = process.env.USER_VM || undefined;;
  const ipVM = process.env.IP_VM || undefined;;
  const sshTarget = `${userVM}@${ipVM}`;

  console.log("--- DEBUG DEPLOIEMENT ---");
  console.log("Chemin absolu calculé :", appMetierRoot);
  console.log("Le dossier existe-t-il ? :", fs.existsSync(appMetierRoot));
  console.log("--------------------------");

  const cicdBackDir = path.join(appMetierRoot, "CICD-back");

  const tasks = [
    {
      folder: appMetierRoot,
      cmd: "git",
      args: ["pull"]
    },
    {
      folder: appMetierRoot,
      cmd: "git",
      args: ["submodule", "sync", "--recursive"]
    },
    {
      folder: appMetierRoot,
      cmd: "git",
      args: ["submodule", "update", "--init", "--recursive", "--remote"]
    },
    {
      folder: cicdBackDir,
      cmd: process.platform === "win32" ? "mvn.cmd" : "mvn",
      args: ["test"]
    },
    {
      folder: cicdRunDir,
      cmd: "docker-compose",
      args: ["up", "-d", "--build"]
    },
    {
      folder: cicdRunDir,
      type: 'dockerTransfer',
      image: 'cicd-run-backend:latest',
      sshTarget: sshTarget,
      useSudo: false,
      sshPassword,
      sudoPassword
    },
    {
      folder: cicdRunDir,
      type: 'dockerTransfer',
      image: 'cicd-run-frontend:latest',
      sshTarget: sshTarget,
      useSudo: false,
      sshPassword,
      sudoPassword
    },
    {
      folder: cicdRunDir,
      type: 'remoteCommand',
      sshTarget: sshTarget,
      command: 'mkdir -p ~/workspace/CICD_project/CICD-run',
      sshPassword
    },
    {
      folder: cicdRunDir,
      type: 'copyFile',
      sshTarget: sshTarget,
      localFile: path.join(cicdRunDir, 'docker-compose.prod.yaml'),
      remotePath: '~/workspace/CICD_project/CICD-run/docker-compose.prod.yaml',
      sshPassword
    },
    {
      folder: cicdRunDir,
      type: 'remoteCommand',
      sshTarget: sshTarget,
      command: 'cd ~/workspace/CICD_project/CICD-run && docker compose -f docker-compose.prod.yaml up -d',
      sshPassword
    },
  ];

  let index = 0;

  function next() {
    if (index < tasks.length) {
      const task = tasks[index++];

      if (!fs.existsSync(task.folder)) {
        const msg = `⚠️ ERREUR : Le dossier est introuvable : ${task.folder}\n`;
        console.error(msg);
        io?.emit('deploy-log', msg);
        // On s'arrête si le dossier n'existe pas
        return res.status(500).json({ error: "Dossier cible introuvable", path: task.folder });
      }

      if (task.type === 'dockerTransfer') {
        transferDockerImageViaSSH({ image: task.image, sshTarget: task.sshTarget, useSudo: task.useSudo, cwd: task.folder, sshPassword: task.sshPassword, sudoPassword: task.sudoPassword }, (error) => {
          if (error) {
            console.error(error);
            io?.emit('deploy-log', `❌ Erreur critique: ${error.message}\n`);
            return res.status(500).json({ error: "Échec du déploiement", details: error.message });
          }
          next();
        });
      } else if (task.type === 'remoteCommand') {
        executeRemoteCommand({ sshTarget: task.sshTarget, command: task.command, cwd: task.folder, sshPassword: task.sshPassword }, (error) => {
          if (error) {
            console.error(error);
            io?.emit('deploy-log', `❌ Erreur critique: ${error.message}\n`);
            return res.status(500).json({ error: "Échec du déploiement", details: error.message });
          }
          next();
        });
      } else if (task.type === 'copyFile') {
        copyFileToRemote({ sshTarget: task.sshTarget, localFile: task.localFile, remotePath: task.remotePath, cwd: task.folder, sshPassword: task.sshPassword }, (error) => {
          if (error) {
            console.error(error);
            io?.emit('deploy-log', `❌ Erreur critique: ${error.message}\n`);
            return res.status(500).json({ error: "Échec du déploiement", details: error.message });
          }
          next();
        });
      } else {
        runCommand(task.cmd, task.args, task.folder, (error) => {
          if (error) {
            console.error(error);
            io?.emit('deploy-log', `❌ Erreur critique: ${error.message}\n`);
            return res.status(500).json({ error: "Échec du déploiement", details: error.message });
          }
          next();
        });
      }

    } else {
      io?.emit('deploy-log', `✅ Déploiement terminé avec succès.\n`);
      res.json({ message: "Déploiement terminé" });
    }
  }

  next();
});