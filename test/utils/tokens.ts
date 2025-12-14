import { sign, SignOptions } from 'jsonwebtoken';
import 'dotenv/config';

const refreshTokenSecurityKey =
  process.env.JWT_SECRET_REFRESH_KEY ||
  process.env.JWT_SECRET ||
  'your-secret-key';

const generateRefreshToken = (payload: any, options: SignOptions): string => {
  return sign(payload, refreshTokenSecurityKey, options);
};

export default generateRefreshToken;
