const express = require('express');
const router = express.Router();
const {
  getBudgets,
  getBudget,
  createBudget,
  updateBudget,
  deleteBudget,
  archiveBudget,
  getBudgetHistory,
} = require('../controllers/budgetController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.route('/').get(getBudgets).post(createBudget);
router.route('/history').get(getBudgetHistory);
router.route('/:id').get(getBudget).put(updateBudget).delete(deleteBudget);
router.route('/:id/archive').post(archiveBudget);

module.exports = router;

