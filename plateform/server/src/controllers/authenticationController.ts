import { Request, Response } from "express";
import User from "../models/userModel.js";
import { admin } from "../app.js";
import jwt from "jsonwebtoken";

export const googleSync = async (req: Request, res: Response): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        const googleToken = authHeader && authHeader.split(" ")[1];

        if (!googleToken) {
            res.status(401).json({ error: "Token Google manquant" });
            return;
        }

        const decodedToken = await admin.auth().verifyIdToken(googleToken);
        const { email, name, picture } = decodedToken;

        const user = await User.findOneAndUpdate(
            { email },
            {
                username: email?.split("@")[0],
                name: name?.split(" ")[1] || "",
                forename: name?.split(" ")[0] || "",
                avatar: picture,
                auth_type: "GOOGLE",
            },
            { upsert: true, new: true }
        );

        const accessToken = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || "secret_key_2026",
            { expiresIn: "24h" }
        );

        res.status(200).json({ user, accessToken });
    } catch (error) {
        res.status(403).json({ error: "Authentification Google échouée" });
    }
};

export const logout = (req: Request, res: Response) => {
    try {
        res.clearCookie("__access__token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        res.status(200).json({ message: "Déconnecté avec succès" });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la déconnexion" });
    }
};