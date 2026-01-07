import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const verifyToken = (options: { role: string }) => {
  return (req: any, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) return res.status(401).json({ error: "Accès refusé" });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret_key_2026");
      req.user = decoded;
      next();
    } catch (error) {
      res.status(403).json({ error: "Token invalide" });
    }
  };
};