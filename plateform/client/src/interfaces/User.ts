export type UserRole = 'admin' | 'user';

export interface UserInterface {
  _id: string;
  username: string;
  fullname: string;
  email: string;
  role: UserRole;
  avatar: string;
  auth_type: 'google';
  createdAt: string | Date;
}