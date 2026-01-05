import admin from 'firebase-admin';

export const verifyFirebaseToken = async (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split('Bearer ')[1];

  if (!token) return res.status(401).json({ message: "Token manquant" });

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken; // C'est ici qu'on injecte l'UID pour le findOne
    next();
  } catch (error) {
    res.status(401).json({ message: "Token invalide" });
  }
};