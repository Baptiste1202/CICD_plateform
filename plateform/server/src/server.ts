import { createServer } from "http";
import { app } from "./app.js";
import { connectToDatabase } from "./database/connectToDB.js";
import { initSockets } from "./sockets/socket.js";
import mongoose from 'mongoose';
import User from './models/User.js'; 
import { authorize } from './middlewares/authMiddleware.js';
import authRoutes from './routes/auth.js';
import { verifyToken } from './middlewares/verifyToken.js';

/**
 * 1. Configuration des Routes
 * On les déclare sur l'objet 'app' avant de démarrer le serveur.
 */

// Routes publiques (Login, etc.)
app.use('/api/auth', authRoutes);

// Route protégée : Seul l'ADMIN peut déployer 
app.post(
  '/api/deploy', 
  verifyToken(),      // 1. Est-ce un utilisateur Firebase valide ?
  authorize(['ADMIN']),     // 2. Est-ce un ADMIN dans ma base MongoDB ?
  (req, res) => {
    res.send("Déploiement lancé...");
  }
);

// Route semi-protégée : Suivi du pipeline en temps réel [cite: 17]
app.get('/api/status', authorize(['ADMIN', 'VIEWER']), (req, res) => {
    res.json({ status: "En cours" });
});

/**
 * 2. Initialisation du serveur
 */
export async function initServer() {
  try {
    // Vérification de l'environnement
    if (!process.env.PORT || !process.env.MONG_URI) {
      console.error("ERREUR: PORT ou MONG_URI manquant dans le fichier .env");
      process.exit(1);
    }

    // Connexion à MongoDB Atlas
    // On utilise votre fonction existante ou mongoose directement
    await mongoose.connect(process.env.MONG_URI);
    console.log("✅ Connecté à MongoDB Atlas");

    // Création du serveur HTTP
    const httpServer = createServer(app);

    // Initialisation des WebSockets (pour le suivi du pipeline en temps réel) [cite: 17]
    initSockets(httpServer);

    // Démarrage
    httpServer.listen(process.env.PORT, () => {
      console.log(`Server listening on port ${process.env.PORT} 🚀`);
    });

  } catch (error) {
    console.error("❌ Erreur lors du démarrage du serveur:", error);
    process.exit(1);
  }
}

// Lancement global
initServer();