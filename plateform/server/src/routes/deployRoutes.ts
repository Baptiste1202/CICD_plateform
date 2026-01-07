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

deployRoutes.post("/", verifyToken({ role: "admin" }), (req, res) => {
  // CORRECTION DU CHEMIN :
  // On remonte depuis src/routes (3 niveaux) pour sortir de CICD_plateform
  const appMetierRoot = path.resolve(__dirname, "../../../../Application_metier");
  const cicdRunDir = path.join(appMetierRoot, "CICD-run");

  // Debug pour vérifier dans ta console Nodemon
  console.log("--- DEBUG DEPLOIEMENT ---");
  console.log("Chemin absolu calculé :", appMetierRoot);
  console.log("Le dossier existe-t-il ? :", fs.existsSync(appMetierRoot));
  console.log("--------------------------");

  const tasks = [
    {
      folder: appMetierRoot,
      cmd: "git",
      args: ["pull"]
    },
    {
      folder: appMetierRoot,
      cmd: "git",
      args: ["submodule", "update", "--init", "--recursive"]
    },
    {
      folder: appMetierRoot,
      cmd: "git",
      args: ["submodule", "update", "--remote", "--merge"]
    },
    {
      folder: cicdRunDir,
      // MODIFICATION POUR MAC : On retire "cmd /c" qui est pour Windows
      cmd: "docker-compose",
      args: ["up", "-d", "--build"]
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

      runCommand(task.cmd, task.args, task.folder, (error) => {
        if (error) {
          console.error(error);
          io?.emit('deploy-log', `❌ Erreur critique: ${error.message}\n`);
          return res.status(500).json({ error: "Échec du déploiement", details: error.message });
        }
        next();
      });

    } else {
      io?.emit('deploy-log', `✅ Déploiement terminé avec succès.\n`);
      res.json({ message: "Déploiement terminé" });
    }
  }

  next();
});