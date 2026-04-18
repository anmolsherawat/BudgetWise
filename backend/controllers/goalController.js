const { prisma } = require('../config/database');

/**
 * @desc    Get all goals
 * @route   GET /api/goals
 * @access  Private
 */
const getGoals = async (req, res, next) => {
  try {
    const goals = await prisma.goal.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: goals,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a goal
 * @route   POST /api/goals
 * @access  Private
 */
const createGoal = async (req, res, next) => {
  try {
    const { title, target, deadline, icon } = req.body;

    if (!title || !target || !deadline) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, target, and deadline',
      });
    }

    const goal = await prisma.goal.create({
      data: {
        userId: req.user.id,
        title,
        target: parseFloat(target),
        deadline,
        icon: icon || 'target',
      },
    });

    res.status(201).json({
      success: true,
      data: goal,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a goal
 * @route   DELETE /api/goals/:id
 * @access  Private
 */
const deleteGoal = async (req, res, next) => {
  try {
    const goal = await prisma.goal.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found',
      });
    }

    await prisma.goal.delete({
      where: { id: req.params.id },
    });

    res.json({
      success: true,
      message: 'Goal deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a goal (typically for updating 'current' amount)
 * @route   PUT /api/goals/:id
 * @access  Private
 */
const updateGoal = async (req, res, next) => {
  try {
    const { title, target, current, deadline, icon } = req.body;

    const goal = await prisma.goal.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found',
      });
    }

    const updatedGoal = await prisma.goal.update({
      where: { id: req.params.id },
      data: {
        title: title !== undefined ? title : goal.title,
        target: target !== undefined ? parseFloat(target) : goal.target,
        current: current !== undefined ? parseFloat(current) : goal.current,
        deadline: deadline !== undefined ? deadline : goal.deadline,
        icon: icon !== undefined ? icon : goal.icon,
      },
    });

    res.json({
      success: true,
      data: updatedGoal,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGoals,
  createGoal,
  deleteGoal,
  updateGoal,
};
