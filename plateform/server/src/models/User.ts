import mongoose, { Schema, model, Document } from 'mongoose';

// 1. Définir l'interface des données
interface IUser extends Document {
  firebaseUid: string;
  email: string;
  role: 'ADMIN' | 'VIEWER';
}

// 2. Créer le Schéma en lui passant l'interface
const userSchema = new Schema<IUser>({
  firebaseUid: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  role: { type: String, enum: ['ADMIN', 'VIEWER'], default: 'VIEWER' }
});

// 3. Exporter le modèle proprement
type UserModel = mongoose.Model<IUser>;
const User = (mongoose.models.User as UserModel) || model<IUser>('User', userSchema);
export default User;