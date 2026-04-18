const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const passport = require('passport');

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post('/register', register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   GET /api/auth/google
 * @desc    Authenticate with Google
 * @access  Public
 */
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

/**
 * @route   GET /api/auth/google/callback
 * @desc    Google auth callback
 * @access  Public
 */
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/login' }), require('../controllers/authController').oauthCallback);

/**
 * @route   GET /api/auth/github
 * @desc    Authenticate with GitHub
 * @access  Public
 */
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

/**
 * @route   GET /api/auth/github/callback
 * @desc    GitHub auth callback
 * @access  Public
 */
router.get('/github/callback', passport.authenticate('github', { session: false, failureRedirect: '/login' }), require('../controllers/authController').oauthCallback);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', protect, getMe);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', protect, updateProfile);

/**
 * @route   PUT /api/auth/password
 * @desc    Change user password
 * @access  Private
 */
router.put('/password', protect, require('../controllers/authController').changePassword);

module.exports = router;
