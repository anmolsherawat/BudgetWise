const express = require('express');
const router = express.Router();
const {
  getGoals,
  createGoal,
  deleteGoal,
  updateGoal,
} = require('../controllers/goalController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.route('/').get(getGoals).post(createGoal);
router.route('/:id').delete(deleteGoal).put(updateGoal);

module.exports = router;
