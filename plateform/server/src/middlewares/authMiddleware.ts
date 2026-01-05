import { Request, Response, NextFunction } from 'express';
import User from '../models/User.js';

export const authorize = (roles: string[] = []) => {
  return async (req: any, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !req.user.uid) {
        console.warn("❌ Utilisateur non identifié - req.user:", req.user);
        res.status(401).json({ message: "Utilisateur non identifié" });
        return;
      }

      console.log("🔍 Recherche utilisateur avec firebaseUid:", req.user.uid);
      
      const foundUser = await User.findOne({ firebaseUid: req.user.uid }).lean();
      
      if (!foundUser) {
        console.warn("❌ Utilisateur non trouvé dans MongoDB");
        res.status(403).json({ message: 'Utilisateur non trouvé' });
        return;
      }

      console.log("✅ Utilisateur trouvé:", foundUser._id, "Rôle:", foundUser.role);

      if (roles.length > 0 && !roles.includes(foundUser.role)) {
        console.warn("❌ Rôle insuffisant. Requis:", roles, "Actuel:", foundUser.role);
        res.status(403).json({ message: 'Accès interdit : Droits insuffisants' });
        return;
      }

      req.user.dbUser = foundUser; // Stocker l'utilisateur MongoDB pour utilisation ultérieure
      next();
    } catch (error) {
      console.error("❌ Erreur dans le middleware authorize:", error);
      res.status(500).json({ message: "Erreur de vérification des droits" });
    }
  };
};