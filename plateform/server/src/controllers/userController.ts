import { Request, Response } from "express";
import User from "../models/userModel.js";
import { createLog } from "./logController.js";
import { logLevels } from "../utils/enums/logLevels.js";

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const size = parseInt(req.query.size as string) || 10;
    const page = parseInt(req.query.page as string) || 0;
    const users = await User.find({}).sort({ createdAt: -1 }).skip(page * size).limit(size);
    const count = await User.countDocuments();
    res.status(200).json({ users, count });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { role, ...otherData } = req.body;
  const requestUser = (req as any).user;

  try {
    const oldUser = await User.findById(id);
    if (!oldUser) {
      res.status(404).json({ error: "Utilisateur non trouvé" });
      return;
    }

    const updatePayload = requestUser.role === 'admin' ? req.body : otherData;
    const user = await User.findByIdAndUpdate(id, updatePayload, { new: true });

    if (user) {
      let changes = [];
      if (oldUser.username !== user.username) changes.push(`pseudo (${oldUser.username} -> ${user.username})`);
      if (oldUser.role !== user.role) changes.push(`rôle (${oldUser.role} -> ${user.role})`);

      if (changes.length > 0) {
        await createLog({
          message: `Modification de l'utilisateur ${user.username} : ${changes.join(', ')}`,
          userId: requestUser._id || requestUser.id,
          level: logLevels.INFO
        });
      }
    }

    res.status(200).json({ user, message: "Profil mis à jour" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    createLog({ message: `Suppression de l'utilisateur ${user?.username}`, userId: req.userId, level: logLevels.INFO });
    res.status(200).json({ message: "Supprimé" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    await User.findByIdAndDelete(req.userId);
    res.status(200).json({ message: "Compte supprimé" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getAuthTypesStat = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await User.aggregate([
      { $group: { _id: "$auth_type", value: { $sum: 1 } } },
      { $project: { label: "$_id", value: 1, _id: 0 } }
    ]);
    res.status(200).json({ data: stats });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};