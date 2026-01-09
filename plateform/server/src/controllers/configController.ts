import { Request, Response } from "express";
import { Config } from "../models/configModel";
import { createLog } from "./logController";
import { logLevels } from "../utils/enums/logLevels";

export const getConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const raw = req.query.keys as string;

    if (!raw) {
      const allConfigs = await Config.find({});
      res.status(200).json({ config: allConfigs });
      return;
    }

    const keys = raw.split(",");
    const configItems = await Config.find({ key: { $in: keys } });

    res.status(200).json({ config: configItems });
  } catch (err: any) {
    res.status(500).json({ error: "Erreur lors de la récupération de la configuration" });
  }
};

export const updateConfig = async (req: Request, res: Response): Promise<void> => {
  const { config } = req.body;
  const adminId = (req as any).user?._id || (req as any).user?.id;

  if (!config || typeof config !== "object") {
    res.status(400).json({ message: "Format de configuration invalide" });
    return;
  }

  try {
    const keys = Object.keys(config);

    for (const key of keys) {
      const newValue = config[key];

      const existingConfig = await Config.findOne({ key });

      if (!existingConfig || existingConfig.value !== newValue) {

        await Config.findOneAndUpdate(
            { key },
            { value: newValue },
            { new: true, upsert: true }
        );

        const oldValText = existingConfig ? ` (ancien: ${existingConfig.value})` : "";

        await createLog({
          level: logLevels.INFO,
          message: `Réglage [${key}] modifié : ${newValue}${oldValText}`,
          userId: adminId,
        });
      }
    }

    res.json({ message: "Configuration mise à jour avec succès" });
  } catch (err: any) {
    res.status(500).json({ error: "Erreur lors de la mise à jour" });
  }
};