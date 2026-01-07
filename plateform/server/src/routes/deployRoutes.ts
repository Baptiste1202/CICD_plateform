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

// Configuration dynamique
const SSH_TARGET = process.env.DEPLOY_SSH_TARGET || 'ubuntu@127.0.0.1';
const SSH_PORT = process.env.DEPLOY_SSH_PORT || '2222';
const REMOTE_PATH = process.env.DEPLOY_REMOTE_PATH || '/home/ubuntu/CICD-run';
const FULL_SSH_TARGET = `${SSH_TARGET}`;

function runCommand(command: string, args: string[], cwd: string, callback: (error?: any) => void) {
  io?.emit('deploy-log', `> [${path.basename(cwd)}] ${command} ${args.join(' ')}\n`);

  // MODIFICATION : On injecte DOCKER_HOST pour builder sur la VM (fix erreur 17)
  const child = spawn(command, args, {
    cwd,
    shell: true,
    env: {
      ...process.env,
      DOCKER_HOST: `ssh://${SSH_TARGET}:${SSH_PORT}`
    }
  });

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

  io?.emit('deploy-log', `> [${path.basename(cwd)}] docker save ${image} | ssh -p ${SSH_PORT} ${sshTarget} "${useSudo ? 'sudo ' : ''}docker load"\n`);

  const saveProc = spawn("docker", ["save", image], { cwd, shell: false });
  const remoteCmd = `${useSudo ? 'sudo -S ' : ''}docker load`;

  const sshProc = spawn("ssh", ["-p", SSH_PORT, "-C", "-o", "StrictHostKeyChecking=no", sshTarget, remoteCmd], { cwd, shell: false });

  if (useSudo && sudoPassword) {
    try {
      sshProc.stdin.write(`${sudoPassword}\n`);
    } catch (e) {
      io?.emit('deploy-log', `LOG: Erreur lors de l'envoi du mot de passe sudo: ${e}\n`);
    }
  }

  saveProc.stdout.pipe(sshProc.stdin);

  saveProc.stderr.on('data', (d) => io?.emit('deploy-log', `LOG[docker save]: ${d.toString()}`));
  sshProc.stdout.on('data', (d) => io?.emit('deploy-log', d.toString()));
  sshProc.stderr.on('data', (d) => io?.emit('deploy-log', `LOG[ssh]: ${d.toString()}`));

  let finished = false;
  const TRANSFER_TIMEOUT_MS = 30 * 60 * 1000;
  const timeout = setTimeout(() => {
    io?.emit('deploy-log', `❌ Transfert expiré.\n`);
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
    if (code !== 0) finalize(new Error(`ssh code ${code}`));
    else {
      io?.emit('deploy-log', `✅ Image transférée sur ${sshTarget}.\n`);
      finalize();
    }
  });

  saveProc.on('close', (code) => {
    if (code !== 0 && !finished) finalize(new Error(`docker save code ${code}`));
  });
}

function executeRemoteCommand(params: { sshTarget: string; command: string; cwd: string; sshPassword?: string }, callback: (error?: any) => void) {
  const { sshTarget, command, cwd, sshPassword } = params;

  io?.emit('deploy-log', `> [remote] ssh -p ${SSH_PORT} ${sshTarget} "${command}"\n`);

  const sshProc = spawn("ssh", ["-p", SSH_PORT, "-o", "StrictHostKeyChecking=no", sshTarget, command], { cwd, shell: false });

  sshProc.stdout.on('data', (d) => io?.emit('deploy-log', d.toString()));
  sshProc.stderr.on('data', (d) => io?.emit('deploy-log', `LOG[ssh]: ${d.toString()}`));

  sshProc.on('close', (code) => {
    if (code !== 0) callback(new Error(`Commande distante échouée (${code})`));
    else {
      io?.emit('deploy-log', `✅ Commande distante exécutée.\n`);
      callback();
    }
  });
}

function copyFileToRemote(params: { sshTarget: string; localFile: string; remotePath: string; cwd: string; sshPassword?: string }, callback: (error?: any) => void) {
  const { sshTarget, localFile, remotePath, cwd, sshPassword } = params;

  io?.emit('deploy-log', `> [scp] Transfert → ${sshTarget}:${remotePath}\n`);

  const scpProc = spawn("scp", ["-P", SSH_PORT, "-o", "StrictHostKeyChecking=no", localFile, `${sshTarget}:${remotePath}`], { cwd, shell: false });

  scpProc.stderr.on('data', (d) => io?.emit('deploy-log', `LOG[scp]: ${d.toString()}`));

  scpProc.on('close', (code) => {
    if (code !== 0) callback(new Error(`SCP échoué (${code})`));
    else {
      io?.emit('deploy-log', `✅ Fichier transféré.\n`);
      callback();
    }
  });
}

deployRoutes.post("/", verifyToken({ role: "admin" }), (req, res) => {
  const appMetierRoot = path.resolve(__dirname, "../../../../Application_metier");
  const cicdRunDir = path.join(appMetierRoot, "CICD-run");
  const sshPassword = (req.body?.sshPassword as string) || process.env.DEPLOY_SSH_PASSWORD || undefined;
  const sudoPassword = (req.body?.sudoPassword as string) || process.env.DEPLOY_SUDO_PASSWORD || undefined;

  const cicdBackDir = path.join(appMetierRoot, "CICD-back");

  const tasks = [
    { folder: appMetierRoot, cmd: "git", args: ["pull"] },
    { folder: appMetierRoot, cmd: "git", args: ["submodule", "sync", "--recursive"] },
    { folder: appMetierRoot, cmd: "git", args: ["submodule", "update", "--init", "--recursive", "--remote"] },
    { folder: cicdBackDir, cmd: process.platform === "win32" ? "mvn.cmd" : "mvn", args: ["test"] },

    // BUILD DOCKER (Se fera sur la VM via DOCKER_HOST)
    { folder: cicdRunDir, cmd: "docker-compose", args: ["up", "-d", "--build"] },

    {
      folder: cicdRunDir,
      type: 'dockerTransfer',
      image: 'cicd-run-backend:latest',
      sshTarget: SSH_TARGET,
      useSudo: false,
      sshPassword, sudoPassword
    },
    {
      folder: cicdRunDir,
      type: 'dockerTransfer',
      image: 'cicd-run-frontend:latest',
      sshTarget: SSH_TARGET,
      useSudo: false,
      sshPassword, sudoPassword
    },
    {
      folder: cicdRunDir,
      type: 'remoteCommand',
      sshTarget: SSH_TARGET,
      command: `mkdir -p ${REMOTE_PATH}`,
      sshPassword
    },
    {
      folder: cicdRunDir,
      type: 'copyFile',
      sshTarget: SSH_TARGET,
      localFile: path.join(cicdRunDir, 'docker-compose.prod.yaml'),
      remotePath: `${REMOTE_PATH}/docker-compose.prod.yaml`,
      sshPassword
    },
    {
      folder: cicdRunDir,
      type: 'remoteCommand',
      sshTarget: SSH_TARGET,
      command: `cd ${REMOTE_PATH} && docker-compose -f docker-compose.prod.yaml up -d`,
      sshPassword
    },
  ];

  let index = 0;

  function next() {
    if (index < tasks.length) {
      const task: any = tasks[index++];

      if (!fs.existsSync(task.folder)) {
        return res.status(500).json({ error: "Dossier introuvable", path: task.folder });
      }

      const cb = (error?: any) => {
        if (error) {
          io?.emit('deploy-log', `❌ Erreur : ${error.message}\n`);
          return res.status(500).json({ error: "Échec du déploiement", details: error.message });
        }
        next();
      };

      if (task.type === 'dockerTransfer') transferDockerImageViaSSH(task, cb);
      else if (task.type === 'remoteCommand') executeRemoteCommand(task, cb);
      else if (task.type === 'copyFile') copyFileToRemote(task, cb);
      else runCommand(task.cmd, task.args, task.folder, cb);

    } else {
      io?.emit('deploy-log', `✅ Déploiement terminé avec succès.\n`);
      res.json({ message: "Déploiement terminé" });
    }
  }

  next();
});