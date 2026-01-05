import express from 'express';
import User from '../models/User'; // On importe le même modèle

const router = express.Router();

router.post('/login-success', async (req, res) => {
  const { uid, email } = req.body;
  try {
    let existingUser = await User.findOne({ firebaseUid: uid });
    if (!existingUser) {
      existingUser = await User.create({
        firebaseUid: uid,
        email: email,
        role: 'VIEWER'
      });
    }
    res.status(200).json(existingUser);
  } catch (err) {
    res.status(500).send("Erreur");
  }
});

export default router;