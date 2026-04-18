const jwt = require('jsonwebtoken');
const { prisma } = require('../config/database');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        provider: 'local',
        currency: 'USD',
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        currency: true,
        createdAt: true,
      },
    });

    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (!user.password) {
      return res.status(401).json({
        success: false,
        message: 'Please use OAuth login for this account',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    res.json({
      success: true,
      token: generateToken(user.id),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        currency: user.currency,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        currency: true,
        createdAt: true,
      },
    });

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, currency, email, occupation, lifestyle } = req.body;

    let updateData = {};
    if (name !== undefined) updateData.name = name;
    if (currency !== undefined) updateData.currency = currency;
    if (occupation !== undefined) updateData.occupation = occupation;
    if (lifestyle !== undefined) updateData.lifestyle = lifestyle;

    if (email !== undefined) {
      const newEmail = email.toLowerCase();
      if (newEmail !== req.user.email) {
        const existing = await prisma.user.findUnique({ where: { email: newEmail } });
        if (existing) {
          return res.status(400).json({
            success: false,
            message: 'Email already in use',
          });
        }
        updateData.email = newEmail;
      }
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        currency: true,
        occupation: true,
        lifestyle: true,
        createdAt: true,
      },
    });

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide currentPassword and newPassword',
      });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters',
      });
    }

    const userRecord = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!userRecord || !userRecord.password) {
      return res.status(400).json({
        success: false,
        message: 'Password change not available for this account',
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, userRecord.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword },
    });

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

const oauthCallback = (req, res, next) => {
  try {
    const token = generateToken(req.user.id);
    const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${FRONTEND_URL}/dashboard?token=${token}`);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  oauthCallback,
};
