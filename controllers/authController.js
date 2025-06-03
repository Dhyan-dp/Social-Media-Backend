import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { validateRegisterInput } from '../utils/validateInput.js';
import { sendActivationEmail } from '../utils/sendEmail.js';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// REGISTER USER
export const registerUser = async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  const { valid, errors } = validateRegisterInput({
    username,
    email,
    password,
    confirmPassword,
  });

  if (!valid) return res.status(400).json({ errors });

  try {
    // Check if username or email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        isVerified: false,
      },
    });

    // Generate activation token
    const activationToken = jwt.sign({ userId: newUser.id }, process.env.ACTIVATION_SECRET, {
      expiresIn: '1d',
    });

    const activationLink = `${process.env.CLIENT_URL}/activate?token=${activationToken}`;

    // Send activation email
    await sendActivationEmail(newUser.email, activationLink);

    return res.status(201).json({
      message: 'User registered. Please check your email to activate your account.',
    });
  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({ error: 'Server error during registration.' });
  }
};

// ACTIVATE ACCOUNT
export const activateAccount = async (req, res) => {
  const { token } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.ACTIVATION_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: 'Account is already activated.' });
    }

    await prisma.user.update({
      where: { id: decoded.userId },
      data: { isVerified: true },
    });

    return res.status(200).json({ message: 'Account activated successfully.' });
  } catch (error) {
    console.error('Activation Error:', error);
    return res.status(400).json({ error: 'Invalid or expired activation token.' });
  }
};

// LOGIN USER

import validator from 'validator';

export const loginUser = async (req, res) => {
  const { identifier, password } = req.body;

  try {
    if (!identifier || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Dynamically determine whether identifier is an email or username
    let user;
    if (validator.isEmail(identifier)) {
      user = await prisma.user.findUnique({ where: { email: identifier } });
    } else {
      user = await prisma.user.findUnique({ where: { username: identifier } });
    }

    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ error: 'Please activate your account first' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate tokens
    const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: '15m',
    });
    const refreshToken = jwt.sign({ userId: user.id }, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: '7d',
    });

    // Store refresh token in httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: 'Login successful',
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (err) {
    console.error('Login error', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// REFERESH TOKEN

export const refreshAccessToken = (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ error: 'No refresh token' });

  try {
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    const accessToken = jwt.sign({ userId: decoded.userId }, process.env.JWT_SECRET, {
      expiresIn: '15m',
    });

    res.status(200).json({ accessToken });
  } catch (err) {
    console.log(err);

    res.status(403).json({ error: 'Invalid refresh token' });
  }
};

//LOGOUT CONTROLLER

export const logoutUser = (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
  });

  res.status(200).json({ message: 'Logged out successfully' });
};
