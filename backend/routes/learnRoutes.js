const express = require('express');
const router = express.Router();
const { toggleLesson, getStats } = require('../controllers/learnController');
const { protect } = require('../middleware/auth');

router.get('/stats', protect, getStats);
router.post('/toggle', protect, toggleLesson);

module.exports = router;
