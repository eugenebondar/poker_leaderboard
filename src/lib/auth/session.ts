import { SessionOptions } from 'iron-session';

export const sessionOptions: SessionOptions = {
  cookieName: 'admin_session',
  password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
};

export type AdminSession = {
  isAdmin?: boolean;
};
