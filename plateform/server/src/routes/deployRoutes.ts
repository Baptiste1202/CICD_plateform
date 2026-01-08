import express from "express";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { verifyToken } from "../middlewares/verifyToken.js";
import { io } from "../sockets/socket.js";
import { Build } from "../models/buildModel.js";
import { BuildStatus } from "../interfaces/IBuild.js";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const deployRoutes = express.Router();

// Global map to track pipeline control states for cancellation
const pipelineControls = new Map<string, {
  paused: boolean;
  cancelled: boolean;
  currentProcess?: any;
}>();


function runCommand(command: string, args: string[], cwd: string, buildId: string, callback: (error?: any) => void) {
  io?.emit('deploy-log', `> [${path.basename(cwd)}] ${command} ${args.join(' ')}\n`);

  const env = {
    ...process.env,
    SONAR_TOKEN: process.env.SONAR_TOKEN
  };

  const child = spawn(command, args, { cwd, shell: true, env });

  // Store process reference for cancellation
  const control = pipelineControls.get(buildId);
  if (control) {
    control.currentProcess = child;
  }

  child.stdout.on('data', (data) => io?.emit('deploy-log', data.toString()));
  child.stderr.on('data', (data) => io?.emit('deploy-log', `LOG: ${data.toString()}`));

  child.on('close', (code) => {
    // Check if cancelled
    if (control?.cancelled) {
      callback(new Error('Pipeline cancelled by user'));
      return;
    }

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

  const sshProc = spawn("ssh", ["-C", "-o", "StrictHostKeyChecking=no", sshTarget, remoteCmd], { cwd, shell: false });

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
    io?.emit('deploy-log', `❌ Transfert expiré après ${Math.round(TRANSFER_TIMEOUT_MS / 60000)} min.\n`);
    finalize(new Error('Transfert de l\'image expiré'));
  }, TRANSFER_TIMEOUT_MS);

  const finalize = (err?: any) => {
    if (finished) return;
    finished = true;
    clearTimeout(timeout);
    try { saveProc.kill(); } catch { }
    try { sshProc.kill(); } catch { }
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

deployRoutes.post("/", verifyToken({ role: "admin" }), async (req, res) => {
  const appMetierRoot = path.resolve(__dirname, "../../../../Application_metier");
  const cicdRunDir = path.join(appMetierRoot, "CICD-run");
  const cicdBackDir = path.join(appMetierRoot, "CICD-back");
  const sshPassword = (req.body?.sshPassword as string) || process.env.DEPLOY_SSH_PASSWORD || undefined;
  const sudoPassword = (req.body?.sudoPassword as string) || process.env.DEPLOY_SUDO_PASSWORD || undefined;
  const userVM = process.env.USER_VM || undefined;;
  const ipVM = process.env.IP_VM || undefined;;
  const sshTarget = `${userVM}@${ipVM}`;


  // Créer un objet Build au début du déploiement
  const deploymentId = new mongoose.Types.ObjectId().toString();
  // Générer un tag de version basé sur la date et l'heure (format: YYYYMMDD-HHMMSS)
  const now = new Date();
  const imageTag = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
  const images = [`cicd-plateform-backend:${imageTag}`, `cicd-plateform-frontend:${imageTag}`];
  const userId = (req as any).user?.id;

  let buildId: string | null = null;

  try {
    const build = await Build.create({
      projectName: "CICD_project",
      status: BuildStatus.RUNNING,
      image: images[0],
      images: images,
      deploymentId: deploymentId,
      logs: [`Déploiement démarré à ${new Date().toISOString()}`],
      user: userId,
    });

    buildId = build._id.toString();

    // Initialize pipeline control state
    pipelineControls.set(buildId, { paused: false, cancelled: false });

    io?.emit('deploy-log', `🚀 Build créé avec ID: ${buildId}\n`);
    io?.emit('deploy-log', `📦 Images à déployer: ${images.join(', ')}\n`);

  } catch (error: any) {
    console.error("Erreur lors de la création du build:", error);
    io?.emit('deploy-log', `❌ Erreur lors de la création du build: ${error.message}\n`);
    return res.status(500).json({ error: "Erreur lors de la création du build", details: error.message });
  }

  const tasks = [
    {
      folder: appMetierRoot,
      cmd: "git",
      args: ["pull", "origin", "main"]
    },
    {
      folder: appMetierRoot,
      cmd: "git",
      args: ["submodule", "sync", "--recursive"]
    },
    {
      folder: appMetierRoot,
      cmd: "git",
      args: ["submodule", "update", "--init", "--recursive", "--remote", "--force"]
    },
    {
      folder: cicdBackDir,
      cmd: process.platform === "win32" ? "mvn.cmd" : "mvn",
      args: [
        "clean",
        "org.jacoco:jacoco-maven-plugin:0.8.10:prepare-agent", // 1. Prépare l'écouteur
        "verify",                                            // 2. Exécute les tests
        "org.jacoco:jacoco-maven-plugin:0.8.10:report",      // 3. Génère le XML
        "org.sonarsource.scanner.maven:sonar-maven-plugin:3.9.1.2184:sonar",
        `-Dsonar.token=${process.env.SONAR_TOKEN}`,
        "-Dsonar.host.url=http://localhost:9000",
        "-Dsonar.projectKey=cicd-sonar",
        "-Dsonar.projectName=cicd-project",
        "-Dsonar.coverage.jacoco.xmlReportPaths=target/site/jacoco/jacoco.xml"
      ]
    },
    {
      folder: cicdRunDir,
      cmd: "docker-compose",
      args: ["build"]
    },
    {
      folder: cicdRunDir,
      cmd: "docker",
      args: ["tag", "cicd-run-backend:latest", images[0]]
    },
    {
      folder: cicdRunDir,
      cmd: "docker",
      args: ["tag", "cicd-run-frontend:latest", images[1]]
    },
    {
      folder: cicdRunDir,
      type: 'dockerTransfer',
      image: images[0],
      sshTarget: sshTarget,
      useSudo: false,
      sshPassword,
      sudoPassword
    },
    {
      folder: cicdRunDir,
      type: 'dockerTransfer',
      image: images[1],
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
      type: 'createEnvFile',
      envContent: `BACKEND_IMAGE=${images[0]}\nFRONTEND_IMAGE=${images[1]}\n`
    },
    {
      folder: cicdRunDir,
      type: 'copyFile',
      sshTarget: sshTarget,
      localFile: path.join(cicdRunDir, '.env'),
      remotePath: '~/workspace/CICD_project/CICD-run/.env',
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

  async function updateBuildLog(message: string) {
    if (buildId) {
      try {
        await Build.findByIdAndUpdate(buildId, { $push: { logs: message } });
      } catch (error) {
        console.error("Erreur lors de la mise à jour du log du build:", error);
      }
    }
  }

  async function markBuildFailed(errorMessage: string) {
    if (buildId) {
      try {
        await Build.findByIdAndUpdate(buildId, {
          status: BuildStatus.FAILED,
          $push: { logs: `❌ Échec: ${errorMessage}` }
        });
        io?.emit('deploy-log', `📊 Build ${buildId} marqué comme échoué\n`);
      } catch (error) {
        console.error("Erreur lors de la mise à jour du build:", error);
      }
    }
  }

  async function markBuildSuccess() {
    if (buildId) {
      try {
        // Unmark all previous builds as deployed
        await Build.updateMany({ isDeployed: true }, { isDeployed: false });

        // Mark this build as successful and deployed
        await Build.findByIdAndUpdate(buildId, {
          status: BuildStatus.SUCCESS,
          isDeployed: true,
          $push: { logs: `✅ Déploiement terminé avec succès à ${new Date().toISOString()}` }
        });
        io?.emit('deploy-log', `📊 Build ${buildId} marqué comme réussi et déployé\n`);
      } catch (error) {
        console.error("Erreur lors de la mise à jour du build:", error);
      }
    }
  }

  async function next() {
    // Check if pipeline has been cancelled
    const control = pipelineControls.get(buildId!);
    if (control?.cancelled) {
      await Build.findByIdAndUpdate(buildId, {
        status: BuildStatus.CANCELLED,
        $push: { logs: `🛑 Pipeline cancelled at ${new Date().toISOString()}` }
      });
      io?.emit('deploy-log', `🛑 Pipeline cancelled by user\n`);
      pipelineControls.delete(buildId!);
      return res.status(200).json({ message: "Pipeline cancelled" });
    }

    // Check if pipeline has been paused
    if (control?.paused) {
      io?.emit('deploy-log', `⏸️ Pipeline paused\n`);
      await Build.findByIdAndUpdate(buildId, { status: BuildStatus.PAUSED });

      // Wait for resume
      await new Promise<void>((resolve) => {
        const checkInterval = setInterval(() => {
          const currentControl = pipelineControls.get(buildId!);
          if (!currentControl?.paused || currentControl?.cancelled) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 500);
      });

      // Check if cancelled while paused
      if (control?.cancelled) {
        return;
      }

      io?.emit('deploy-log', `▶️ Pipeline resumed\n`);
      await Build.findByIdAndUpdate(buildId, { status: BuildStatus.RUNNING });
    }

    if (index < tasks.length) {
      const task = tasks[index++];

      if (!fs.existsSync(task.folder)) {
        const msg = `⚠️ ERREUR : Le dossier est introuvable : ${task.folder}\n`;
        io?.emit('deploy-log', msg);
        await markBuildFailed(`Dossier introuvable: ${task.folder}`);
        return res.status(500).json({ error: "Dossier cible introuvable", path: task.folder });
      }

      if (task.type === 'dockerTransfer') {
        transferDockerImageViaSSH({ image: task.image, sshTarget: task.sshTarget, useSudo: task.useSudo, cwd: task.folder, sshPassword: task.sshPassword, sudoPassword: task.sudoPassword }, async (error) => {
          if (error) {
            io?.emit('deploy-log', `❌ Erreur critique: ${error.message}\n`);
            await markBuildFailed(error.message);
            return res.status(500).json({ error: "Échec du déploiement", details: error.message });
          }
          await updateBuildLog(`✅ Image ${task.image} transférée avec succès`);
          next();
        });
      } else if (task.type === 'createEnvFile') {
        // Créer le fichier .env avec les variables d'environnement
        const envFilePath = path.join(task.folder, '.env');
        try {
          fs.writeFileSync(envFilePath, task.envContent);
          io?.emit('deploy-log', `✅ Fichier .env créé avec les images versionnées\n`);
          await updateBuildLog(`✅ Fichier .env créé`);
          next();
        } catch (error: any) {
          console.error(error);
          io?.emit('deploy-log', `❌ Erreur lors de la création du fichier .env: ${error.message}\n`);
          await markBuildFailed(error.message);
          return res.status(500).json({ error: "Échec de la création du fichier .env", details: error.message });
        }
      } else if (task.type === 'remoteCommand') {
        executeRemoteCommand({ sshTarget: task.sshTarget, command: task.command, cwd: task.folder, sshPassword: task.sshPassword }, async (error) => {
          if (error) {
            io?.emit('deploy-log', `❌ Erreur critique: ${error.message}\n`);
            await markBuildFailed(error.message);
            return res.status(500).json({ error: "Échec du déploiement", details: error.message });
          }
          await updateBuildLog(`✅ Commande distante exécutée: ${task.command}`);
          next();
        });
      } else if (task.type === 'copyFile') {
        copyFileToRemote({ sshTarget: task.sshTarget, localFile: task.localFile, remotePath: task.remotePath, cwd: task.folder, sshPassword: task.sshPassword }, async (error) => {
          if (error) {
            io?.emit('deploy-log', `❌ Erreur critique: ${error.message}\n`);
            await markBuildFailed(error.message);
            return res.status(500).json({ error: "Échec du déploiement", details: error.message });
          }
          await updateBuildLog(`✅ Fichier copié: ${path.basename(task.localFile)}`);
          next();
        });
      } else {
        runCommand(task.cmd, task.args, task.folder, buildId!, async (error) => {
          if (error) {
            io?.emit('deploy-log', `❌ Erreur critique: ${error.message}\n`);
            await markBuildFailed(error.message);
            return res.status(500).json({ error: "Échec du déploiement", details: error.message });
          }
          await updateBuildLog(`✅ Commande exécutée: ${task.cmd} ${task.args.join(' ')}`);
          next();
        });
      }
    } else {
      await markBuildSuccess();
      pipelineControls.delete(buildId!); // Cleanup control state
      io?.emit('deploy-log', `✅ Déploiement terminé avec succès.\n`);
      res.json({
        message: "Déploiement terminé",
        buildId: buildId,
        deploymentId: deploymentId
      });
    }
  }

  next();
});

// Route pour redéployer une image existante depuis un build
deployRoutes.post("/redeploy/:buildId", verifyToken({ role: "admin" }), async (req, res) => {
  const { buildId } = req.params;
  const cicdRunDir = path.resolve(__dirname, "../../../../Application_metier/CICD-run");
  const sshPassword = (req.body?.sshPassword as string) || process.env.DEPLOY_SSH_PASSWORD || undefined;
  const sudoPassword = (req.body?.sudoPassword as string) || process.env.DEPLOY_SUDO_PASSWORD || undefined;
  const userVM = process.env.USER_VM || undefined;
  const ipVM = process.env.IP_VM || undefined;
  const sshTarget = `${userVM}@${ipVM}`;
  const userId = (req as any).user?.id;

  try {
    // Récupérer le build original pour obtenir les images
    const originalBuild = await Build.findById(buildId);
    if (!originalBuild) {
      return res.status(404).json({ error: "Build introuvable" });
    }

    if (!originalBuild.images || originalBuild.images.length === 0) {
      return res.status(400).json({ error: "Aucune image disponible pour ce build" });
    }

    const images = originalBuild.images;
    const newDeploymentId = new mongoose.Types.ObjectId().toString();

    // Créer un nouveau build pour le redéploiement
    const newBuild = await Build.create({
      projectName: originalBuild.projectName,
      status: BuildStatus.RUNNING,
      image: images[0],
      images: images,
      deploymentId: newDeploymentId,
      logs: [`Redéploiement démarré à ${new Date().toISOString()} depuis build ${buildId}`],
      user: userId,
    });

    const newBuildId = newBuild._id.toString();
    io?.emit('deploy-log', `🔄 Redéploiement du build ${buildId}\n`);
    io?.emit('deploy-log', `🚀 Nouveau build créé avec ID: ${newBuildId}\n`);
    io?.emit('deploy-log', `📦 Images à redéployer: ${images.join(', ')}\n`);

    let index = 0;

    async function updateBuildLog(message: string) {
      try {
        await Build.findByIdAndUpdate(newBuildId, { $push: { logs: message } });
      } catch (error) {
        console.error("Erreur lors de la mise à jour du log du build:", error);
      }
    }

    async function markBuildFailed(errorMessage: string) {
      try {
        await Build.findByIdAndUpdate(newBuildId, {
          status: BuildStatus.FAILED,
          $push: { logs: `❌ Échec: ${errorMessage}` }
        });
        io?.emit('deploy-log', `📊 Build ${newBuildId} marqué comme échoué\n`);
      } catch (error) {
        console.error("Erreur lors de la mise à jour du build:", error);
      }
    }

    async function markBuildSuccess() {
      try {
        await Build.findByIdAndUpdate(newBuildId, {
          status: BuildStatus.SUCCESS,
          $push: { logs: `✅ Redéploiement terminé avec succès à ${new Date().toISOString()}` }
        });
        io?.emit('deploy-log', `📊 Build ${newBuildId} marqué comme réussi\n`);
      } catch (error) {
        console.error("Erreur lors de la mise à jour du build:", error);
      }
    }

    // Vérifier si les images existent sur la VM pour éviter le transfert inutile
    let needsTransfer = true;

    // Tâche de vérification des images sur la VM
    const checkImagesCommand = `docker image inspect ${images[0]} ${images[1]} > /dev/null 2>&1 && echo "EXISTS" || echo "MISSING"`;

    io?.emit('deploy-log', `🔍 Vérification de l'existence des images sur la VM...\n`);

    executeRemoteCommand({
      sshTarget: sshTarget,
      command: checkImagesCommand,
      cwd: cicdRunDir,
      sshPassword: sshPassword
    }, async (error) => {
      if (error) {
        io?.emit('deploy-log', `ℹ️ Images non trouvées sur la VM, transfert nécessaire\n`);
        needsTransfer = true;
      } else {
        io?.emit('deploy-log', `✅ Images déjà présentes sur la VM, pas de transfert nécessaire\n`);
        needsTransfer = false;
      }
      await updateBuildLog(needsTransfer ? `Images non présentes sur VM, transfert requis` : `Images déjà sur VM, skip transfert`);

      // Construire les tâches en fonction de la présence des images
      const tasks = [];

      // Si les images doivent être transférées
      if (needsTransfer) {
        tasks.push(
          {
            folder: cicdRunDir,
            type: 'dockerTransfer',
            image: images[0],
            sshTarget: sshTarget,
            useSudo: false,
            sshPassword,
            sudoPassword
          },
          {
            folder: cicdRunDir,
            type: 'dockerTransfer',
            image: images[1],
            sshTarget: sshTarget,
            useSudo: false,
            sshPassword,
            sudoPassword
          }
        );
      }

      // Tâches communes (toujours exécutées)
      tasks.push(
        {
          folder: cicdRunDir,
          type: 'remoteCommand',
          sshTarget: sshTarget,
          command: 'mkdir -p ~/workspace/CICD_project/CICD-run',
          sshPassword
        },
        {
          folder: cicdRunDir,
          type: 'createEnvFile',
          envContent: `BACKEND_IMAGE=${images[0]}\nFRONTEND_IMAGE=${images[1]}\n`
        },
        {
          folder: cicdRunDir,
          type: 'copyFile',
          sshTarget: sshTarget,
          localFile: path.join(cicdRunDir, '.env'),
          remotePath: '~/workspace/CICD_project/CICD-run/.env',
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
        }
      );

      let taskIndex = 0;

      async function next() {
        if (taskIndex < tasks.length) {
          const task = tasks[taskIndex++];

          if (!fs.existsSync(task.folder)) {
            const msg = `⚠️ ERREUR : Le dossier est introuvable : ${task.folder}\n`;
            console.error(msg);
            io?.emit('deploy-log', msg);
            markBuildFailed(`Dossier introuvable: ${task.folder}`).then(() => {
              res.status(500).json({ error: "Dossier cible introuvable", path: task.folder });
            });
            return;
          }

          if (task.type === 'dockerTransfer') {
            transferDockerImageViaSSH({ image: task.image, sshTarget: task.sshTarget, useSudo: task.useSudo, cwd: task.folder, sshPassword: task.sshPassword, sudoPassword: task.sudoPassword }, async (error) => {
              if (error) {
                console.error(error);
                io?.emit('deploy-log', `❌ Erreur critique: ${error.message}\n`);
                await markBuildFailed(error.message);
                return res.status(500).json({ error: "Échec du redéploiement", details: error.message });
              }
              await updateBuildLog(`✅ Image ${task.image} transférée avec succès`);
              next();
            });
          } else if (task.type === 'createEnvFile') {
            // Créer le fichier .env avec les variables d'environnement
            const envFilePath = path.join(task.folder, '.env');
            try {
              fs.writeFileSync(envFilePath, task.envContent);
              io?.emit('deploy-log', `✅ Fichier .env créé avec les images versionnées\n`);
              await updateBuildLog(`✅ Fichier .env créé`);
              next();
            } catch (error: any) {
              console.error(error);
              io?.emit('deploy-log', `❌ Erreur lors de la création du fichier .env: ${error.message}\n`);
              await markBuildFailed(error.message);
              return res.status(500).json({ error: "Échec de la création du fichier .env", details: error.message });
            }
          } else if (task.type === 'remoteCommand') {
            executeRemoteCommand({ sshTarget: task.sshTarget, command: task.command, cwd: task.folder, sshPassword: task.sshPassword }, async (error) => {
              if (error) {
                console.error(error);
                io?.emit('deploy-log', `❌ Erreur critique: ${error.message}\n`);
                await markBuildFailed(error.message);
                return res.status(500).json({ error: "Échec du redéploiement", details: error.message });
              }
              await updateBuildLog(`✅ Commande distante exécutée: ${task.command}`);
              next();
            });
          } else if (task.type === 'copyFile') {
            copyFileToRemote({ sshTarget: task.sshTarget, localFile: task.localFile, remotePath: task.remotePath, cwd: task.folder, sshPassword: task.sshPassword }, async (error) => {
              if (error) {
                console.error(error);
                io?.emit('deploy-log', `❌ Erreur critique: ${error.message}\n`);
                await markBuildFailed(error.message);
                return res.status(500).json({ error: "Échec du redéploiement", details: error.message });
              }
              await updateBuildLog(`✅ Fichier copié: ${path.basename(task.localFile)}`);
              next();
            });
          }
        } else {
          markBuildSuccess().then(() => {
            io?.emit('deploy-log', `✅ Redéploiement terminé avec succès.\n`);
            res.json({
              message: "Redéploiement terminé",
              buildId: newBuildId,
              deploymentId: newDeploymentId,
              images: images
            });
          });
        }
      }

      next();
    });

  } catch (error: any) {
    console.error("Erreur lors du redéploiement:", error);
    io?.emit('deploy-log', `❌ Erreur: ${error.message}\n`);
    return res.status(500).json({ error: "Erreur lors du redéploiement", details: error.message });
  }
});

// Pause a running pipeline
deployRoutes.post("/pause/:buildId", verifyToken({ role: "admin" }), async (req, res) => {
  const { buildId } = req.params;

  try {
    const control = pipelineControls.get(buildId);

    if (!control) {
      return res.status(404).json({ error: "Pipeline not found or already completed" });
    }

    if (control.paused) {
      return res.status(400).json({ error: "Pipeline is already paused" });
    }

    // Mark as paused
    control.paused = true;
    io?.emit('deploy-log', `⏸️ Pause requested by user\n`);

    res.json({ message: "Pipeline pause requested" });
  } catch (error: any) {
    console.error("Error pausing pipeline:", error);
    res.status(500).json({ error: "Failed to pause pipeline", details: error.message });
  }
});

// Resume a paused pipeline
deployRoutes.post("/resume/:buildId", verifyToken({ role: "admin" }), async (req, res) => {
  const { buildId } = req.params;

  try {
    const control = pipelineControls.get(buildId);

    if (!control) {
      return res.status(404).json({ error: "Pipeline not found or already completed" });
    }

    if (!control.paused) {
      return res.status(400).json({ error: "Pipeline is not paused" });
    }

    // Mark as resumed
    control.paused = false;
    io?.emit('deploy-log', `▶️ Resume requested by user\n`);

    res.json({ message: "Pipeline resume requested" });
  } catch (error: any) {
    console.error("Error resuming pipeline:", error);
    res.status(500).json({ error: "Failed to resume pipeline", details: error.message });
  }
});

// Cancel a running pipeline
deployRoutes.post("/cancel/:buildId", verifyToken({ role: "admin" }), async (req, res) => {
  const { buildId } = req.params;

  try {
    const control = pipelineControls.get(buildId);

    if (!control) {
      return res.status(404).json({ error: "Pipeline not found or already completed" });
    }

    // Mark as cancelled
    control.cancelled = true;

    // Kill current process if exists
    if (control.currentProcess) {
      try {
        control.currentProcess.kill('SIGTERM');
        io?.emit('deploy-log', `🛑 Killing current process...\n`);
      } catch (killError) {
        console.error("Error killing process:", killError);
      }
    }

    // Update build status
    await Build.findByIdAndUpdate(buildId, {
      status: BuildStatus.CANCELLED,
      $push: { logs: `🛑 Pipeline cancelled by user at ${new Date().toISOString()}` }
    });

    io?.emit('deploy-log', `🛑 Pipeline ${buildId} cancelled by user\n`);

    // Cleanup will happen in next() function

    res.json({ message: "Pipeline cancelled successfully" });
  } catch (error: any) {
    console.error("Error cancelling pipeline:", error);
    res.status(500).json({ error: "Failed to cancel pipeline", details: error.message });
  }
});

// Helper function to cancel a pipeline (can be called from other modules)
export async function cancelPipelineById(buildId: string): Promise<void> {
  const control = pipelineControls.get(buildId);

  if (!control) {
    return; // Pipeline not found or already completed
  }

  // Mark as cancelled
  control.cancelled = true;

  // Kill current process if exists
  if (control.currentProcess) {
    try {
      control.currentProcess.kill('SIGTERM');
      io?.emit('deploy-log', `🛑 Killing current process...\n`);
    } catch (killError) {
      console.error("Error killing process:", killError);
    }
  }

  // Update build status
  await Build.findByIdAndUpdate(buildId, {
    status: BuildStatus.CANCELLED,
    $push: { logs: `🛑 Pipeline cancelled at ${new Date().toISOString()}` }
  });

  io?.emit('deploy-log', `🛑 Pipeline ${buildId} cancelled\n`);
}