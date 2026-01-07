export type UserRole = 'admin' | 'user';

export interface UserInterface {
  _id: string;
  username: string;
  forename: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  auth_type: 'GOOGLE';
  createdAt: string | Date;
}