import dotenv from 'dotenv';
dotenv.config();
import jwt from 'jsonwebtoken';

export const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });
};

// utils/generateRefreshToken.js
export const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: '7d',
  });
};

export const generateActivationToken = (userId) => {
  return jwt.sign({ userId }, process.env.ACTIVATION_SECRET, {
    expiresIn: '1d', // Can be customized in .env if needed
  });
};
