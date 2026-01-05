import admin from 'firebase-admin';

export const verifyToken = (options?: { role?: string }) => {
  return async (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split("Bearer ")[1];
    if (!token) return res.status(401).json({ message: "Token manquant" });

    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = decodedToken;

      // Vérification du rôle si demandé
      if (options?.role && decodedToken.role !== options.role) {
        return res.status(403).json({ message: "Accès refusé" });
      }

      next();
    } catch (error) {
      res.status(401).json({ message: "Token invalide" });
    }
  };
};