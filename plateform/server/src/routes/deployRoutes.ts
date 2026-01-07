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

const SSH_TARGET = process.env.DEPLOY_SSH_TARGET || 'ubuntu@127.0.0.1';
const SSH_PORT = process.env.DEPLOY_SSH_PORT || '2222';
const REMOTE_PATH = process.env.DEPLOY_REMOTE_PATH || '/home/ubuntu/CICD-run';

function runCommand(command: string, args: string[], cwd: string, callback: (error?: any) => void) {
  io?.emit('deploy-log', `> [${path.basename(cwd)}] ${command} ${args.join(' ')}\n`);

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
    if (code !== 0) callback(new Error(`La commande a échoué (code ${code})`));
    else callback();
  });
}

function executeRemoteCommand(params: { sshTarget: string; command: string; cwd: string }, callback: (error?: any) => void) {
  const { sshTarget, command, cwd } = params;
  io?.emit('deploy-log', `> [remote] ssh -p ${SSH_PORT} ${sshTarget} "${command}"\n`);

  const sshProc = spawn("ssh", ["-p", SSH_PORT, "-o", "StrictHostKeyChecking=no", sshTarget, command], { cwd, shell: false });

  sshProc.stdout.on('data', (d) => io?.emit('deploy-log', d.toString()));
  sshProc.stderr.on('data', (d) => io?.emit('deploy-log', `LOG[ssh]: ${d.toString()}`));

  sshProc.on('close', (code) => {
    if (code !== 0) callback(new Error(`Commande distante échouée (${code})`));
    else callback();
  });
}

function copyFileToRemote(params: { sshTarget: string; localFile: string; remotePath: string; cwd: string }, callback: (error?: any) => void) {
  const { sshTarget, localFile, remotePath, cwd } = params;
  io?.emit('deploy-log', `> [scp] Transfert → ${sshTarget}:${remotePath}\n`);

  const scpProc = spawn("scp", ["-P", SSH_PORT, "-o", "StrictHostKeyChecking=no", localFile, `${sshTarget}:${remotePath}`], { cwd, shell: false });

  scpProc.stderr.on('data', (d) => io?.emit('deploy-log', `LOG[scp]: ${d.toString()}`));

  scpProc.on('close', (code) => {
    if (code !== 0) callback(new Error(`SCP échoué (${code})`));
    else callback();
  });
}

deployRoutes.post("/", verifyToken({ role: "admin" }), (req, res) => {
  const appMetierRoot = path.resolve(__dirname, "../../../../Application_metier");
  const cicdRunDir = path.join(appMetierRoot, "CICD-run");
  const cicdBackDir = path.join(appMetierRoot, "CICD-back");
  const sshPassword = (req.body?.sshPassword as string) || process.env.DEPLOY_SSH_PASSWORD || undefined;

  const tasks = [
    { folder: appMetierRoot, cmd: "git", args: ["pull"] },
    { folder: appMetierRoot, cmd: "git", args: ["submodule", "sync", "--recursive"] },
    { folder: appMetierRoot, cmd: "git", args: ["submodule", "update", "--init", "--recursive", "--remote"] },
    { folder: cicdBackDir, cmd: process.platform === "win32" ? "mvn.cmd" : "mvn", args: ["test"] },

    { folder: cicdRunDir, cmd: "docker-compose", args: ["up", "-d", "--build"] },

    {
      folder: cicdRunDir,
      type: 'remoteCommand',
      sshTarget: SSH_TARGET,
      command: `mkdir -p ${REMOTE_PATH}`
    },
    {
      folder: cicdRunDir,
      type: 'copyFile',
      sshTarget: SSH_TARGET,
      localFile: path.join(cicdRunDir, 'docker-compose.yaml'),
      remotePath: `${REMOTE_PATH}/docker-compose.yaml`
    }
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

      if (task.type === 'remoteCommand') executeRemoteCommand(task, cb);
      else if (task.type === 'copyFile') copyFileToRemote(task, cb);
      else runCommand(task.cmd, task.args, task.folder, cb);

    } else {
      io?.emit('deploy-log', `✅ Déploiement terminé avec succès.\n`);
      res.json({ message: "Déploiement terminé" });
    }
  }

  next();
});