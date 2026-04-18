const { prisma } = require('../config/database');

/**
 * @desc    Get all transactions
 * @route   GET /api/transactions
 * @access  Private
 */
const getTransactions = async (req, res, next) => {
  try {
    const { type, category, month, year, limit = 50, skip = 0 } = req.query;

    const where = {
      userId: req.user.id,
    };

    if (type) where.type = type;
    if (category) where.category = category;
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      where.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
      take: parseInt(limit),
      skip: parseInt(skip),
    });

    const total = await prisma.transaction.count({ where });

    res.json({
      success: true,
      count: transactions.length,
      total,
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single transaction
 * @route   GET /api/transactions/:id
 * @access  Private
 */
const getTransaction = async (req, res, next) => {
  try {
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    res.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create transaction
 * @route   POST /api/transactions
 * @access  Private
 */
const createTransaction = async (req, res, next) => {
  try {
    const { type, category, amount, description, date } = req.body;

    if (!type || !category || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Please provide type, category, and amount',
      });
    }

    if (date && new Date(date) > new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Transaction date cannot be in the future',
      });
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId: req.user.id,
        type,
        category,
        amount: parseFloat(amount),
        description: description || '',
        date: date ? new Date(date) : new Date(),
      },
    });

    res.status(201).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update transaction
 * @route   PUT /api/transactions/:id
 * @access  Private
 */
const updateTransaction = async (req, res, next) => {
  try {
    const { type, category, amount, description, date } = req.body;

    let transaction = await prisma.transaction.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    if (date && new Date(date) > new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Transaction date cannot be in the future',
      });
    }

    transaction = await prisma.transaction.update({
      where: { id: req.params.id },
      data: {
        ...(type && { type }),
        ...(category && { category }),
        ...(amount && { amount: parseFloat(amount) }),
        ...(description !== undefined && { description }),
        ...(date && { date: new Date(date) }),
      },
    });

    res.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete transaction
 * @route   DELETE /api/transactions/:id
 * @access  Private
 */
const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    await prisma.transaction.delete({
      where: { id: req.params.id },
    });

    res.json({
      success: true,
      message: 'Transaction deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get transaction analytics
 * @route   GET /api/transactions/analytics
 * @access  Private
 */
const getAnalytics = async (req, res, next) => {
  try {
    const { month, year, startDate: qStartDate, endDate: qEndDate } = req.query;
    let startDate, endDate;

    if (qStartDate && qEndDate) {
      startDate = new Date(qStartDate);
      endDate = new Date(qEndDate);
      endDate.setHours(23, 59, 59, 999);
    } else {
      startDate = new Date(year || new Date().getFullYear(), (month || new Date().getMonth() + 1) - 1, 1);
      endDate = new Date(year || new Date().getFullYear(), month || new Date().getMonth() + 1, 0, 23, 59, 59);
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: req.user.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
    });

    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const savings = income - expenses;

    // Category breakdown
    const categoryBreakdown = {};
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
      });

    // Daily stats for line chart
    const dailyStatsMap = {};
    transactions.forEach((t) => {
      const dateKey = t.date.toISOString().split('T')[0];
      if (!dailyStatsMap[dateKey]) {
        dailyStatsMap[dateKey] = { date: dateKey, income: 0, expense: 0 };
      }
      if (t.type === 'income') dailyStatsMap[dateKey].income += t.amount;
      if (t.type === 'expense') dailyStatsMap[dateKey].expense += t.amount;
    });

    const dailyStats = Object.values(dailyStatsMap).sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({
      success: true,
      data: {
        income,
        expenses,
        savings,
        categoryBreakdown,
        transactionCount: transactions.length,
        dailyStats,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getAnalytics,
};

