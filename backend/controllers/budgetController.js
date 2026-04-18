const { prisma } = require('../config/database');

/**
 * @desc    Get all budgets
 * @route   GET /api/budgets
 * @access  Private
 */
const getBudgets = async (req, res, next) => {
  try {
    const { month, year, startDate, endDate } = req.query;
    
    const where = {
      userId: req.user.id,
    };

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const startYear = start.getFullYear();
      const startMonth = start.getMonth() + 1;
      const endYear = end.getFullYear();
      const endMonth = end.getMonth() + 1;

      if (startYear === endYear) {
        where.year = startYear;
        where.month = { gte: startMonth, lte: endMonth };
      } else {
        where.OR = [
          { year: startYear, month: { gte: startMonth } },
          { year: { gt: startYear, lt: endYear } },
          { year: endYear, month: { lte: endMonth } },
        ];
      }
    } else {
      const currentMonth = month ? parseInt(month) : new Date().getMonth() + 1;
      const currentYear = year ? parseInt(year) : new Date().getFullYear();
      where.month = currentMonth;
      where.year = currentYear;
    }

    const budgets = await prisma.budget.findMany({
      where,
      orderBy: [
        { year: 'asc' },
        { month: 'asc' },
      ],
    });

    res.json({
      success: true,
      count: budgets.length,
      data: budgets,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single budget
 * @route   GET /api/budgets/:id
 * @access  Private
 */
const getBudget = async (req, res, next) => {
  try {
    const budget = await prisma.budget.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found',
      });
    }

    res.json({
      success: true,
      data: budget,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create budget
 * @route   POST /api/budgets
 * @access  Private
 */
const createBudget = async (req, res, next) => {
  try {
    const { category, amount, month, year } = req.body;

    if (!category || !amount || !month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Please provide category, amount, month, and year',
      });
    }

    // Calculate spent amount from transactions
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const expenses = await prisma.transaction.findMany({
      where: {
        userId: req.user.id,
        type: 'expense',
        category,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const spent = expenses.reduce((sum, t) => sum + t.amount, 0);

    const budget = await prisma.budget.create({
      data: {
        userId: req.user.id,
        category,
        amount: parseFloat(amount),
        month: parseInt(month),
        year: parseInt(year),
        spent,
      },
    });

    res.status(201).json({
      success: true,
      data: budget,
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'Budget already exists for this category and month',
      });
    }
    next(error);
  }
};

/**
 * @desc    Update budget
 * @route   PUT /api/budgets/:id
 * @access  Private
 */
const updateBudget = async (req, res, next) => {
  try {
    const { amount } = req.body;

    let budget = await prisma.budget.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found',
      });
    }

    // Recalculate spent if needed
    const startDate = new Date(budget.year, budget.month - 1, 1);
    const endDate = new Date(budget.year, budget.month, 0, 23, 59, 59);

    const expenses = await prisma.transaction.findMany({
      where: {
        userId: req.user.id,
        type: 'expense',
        category: budget.category,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const spent = expenses.reduce((sum, t) => sum + t.amount, 0);

    budget = await prisma.budget.update({
      where: { id: req.params.id },
      data: {
        ...(amount && { amount: parseFloat(amount) }),
        spent,
      },
    });

    res.json({
      success: true,
      data: budget,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete budget
 * @route   DELETE /api/budgets/:id
 * @access  Private
 */
const deleteBudget = async (req, res, next) => {
  try {
    const budget = await prisma.budget.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found',
      });
    }

    await prisma.budget.delete({
      where: { id: req.params.id },
    });

    res.json({
      success: true,
      message: 'Budget deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Archive budget to history
 * @route   POST /api/budgets/:id/archive
 * @access  Private
 */
const archiveBudget = async (req, res, next) => {
  try {
    const budget = await prisma.budget.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found',
      });
    }

    const utilizationPercentage = (budget.spent / budget.amount) * 100;
    let status = 'under';
    if (utilizationPercentage > 100) status = 'over';
    else if (utilizationPercentage >= 90) status = 'met';

    // Create history record
    await prisma.budgetHistory.create({
      data: {
        userId: req.user.id,
        category: budget.category,
        budgetedAmount: budget.amount,
        spentAmount: budget.spent,
        month: budget.month,
        year: budget.year,
        status,
        utilizationPercentage,
      },
    });

    // Delete current budget
    await prisma.budget.delete({
      where: { id: req.params.id },
    });

    res.json({
      success: true,
      message: 'Budget archived successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get budget history
 * @route   GET /api/budgets/history
 * @access  Private
 */
const getBudgetHistory = async (req, res, next) => {
  try {
    const { month, year, category, startDate, endDate, limit = 50, skip = 0 } = req.query;

    const where = {
      userId: req.user.id,
    };

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const startYear = start.getFullYear();
      const startMonth = start.getMonth() + 1;
      const endYear = end.getFullYear();
      const endMonth = end.getMonth() + 1;

      if (startYear === endYear) {
        where.year = startYear;
        where.month = { gte: startMonth, lte: endMonth };
      } else {
        where.OR = [
          { year: startYear, month: { gte: startMonth } },
          { year: { gt: startYear, lt: endYear } },
          { year: endYear, month: { lte: endMonth } },
        ];
      }
    } else if (month && year) {
      where.month = parseInt(month);
      where.year = parseInt(year);
    }

    if (category) where.category = category;

    const history = await prisma.budgetHistory.findMany({
      where,
      orderBy: [
        { year: 'asc' },
        { month: 'asc' },
      ],
      take: parseInt(limit),
      skip: parseInt(skip),
    });

    let total = await prisma.budgetHistory.count({ where });

    // Fallback: if no archived history found for given filters, derive from budgets for the requested period
    let derived = [];
    if (history.length === 0 && ((month && year) || (startDate && endDate))) {
      // Construct budget query with same where clause
      const budgetWhere = { ...where };
      
      const budgets = await prisma.budget.findMany({
        where: budgetWhere,
        orderBy: [
          { year: 'asc' },
          { month: 'asc' },
        ],
      });

      // Fetch transactions for the covered period to calculate actual spent
      // Determine the overall date range for transactions
      let txStartDate, txEndDate;
      if (startDate && endDate) {
        txStartDate = new Date(startDate);
        txEndDate = new Date(endDate);
        // Ensure end of day
        txEndDate.setHours(23, 59, 59, 999);
      } else if (month && year) {
        txStartDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        txEndDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);
      }

      // Fetch all relevant expenses
      const transactions = await prisma.transaction.findMany({
        where: {
          userId: req.user.id,
          type: 'expense',
          date: {
            gte: txStartDate,
            lte: txEndDate,
          },
          category: {
            in: budgets.map(b => b.category),
          },
        },
      });

      derived = budgets
        .sort((a, b) => (a.year - b.year) || (a.month - b.month))
        .map((b) => {
          // Calculate intersection of budget month and requested range
          const budgetStart = new Date(b.year, b.month - 1, 1);
          const budgetEnd = new Date(b.year, b.month, 0, 23, 59, 59, 999);
          
          // Effective range for this budget is the intersection of [budgetStart, budgetEnd] and [txStartDate, txEndDate]
          const effectiveStart = txStartDate > budgetStart ? txStartDate : budgetStart;
          const effectiveEnd = txEndDate < budgetEnd ? txEndDate : budgetEnd;

          // Filter transactions for this specific budget (category + time overlap)
          const relevantTransactions = transactions.filter(t => 
            t.category === b.category && 
            t.date >= effectiveStart && 
            t.date <= effectiveEnd
          );

          const realSpent = relevantTransactions.reduce((sum, t) => sum + t.amount, 0);

          const utilizationPercentage = b.amount > 0 ? (realSpent / b.amount) * 100 : 0;
          let status = 'under';
          if (utilizationPercentage > 100) status = 'over';
          else if (utilizationPercentage >= 90) status = 'met';

          return {
            id: `${b.category}-${b.year}-${b.month}`,
            userId: b.userId,
            category: b.category,
            budgetedAmount: b.amount,
            spentAmount: realSpent, // Use dynamically calculated spent
            month: b.month,
            year: b.year,
            status,
            utilizationPercentage,
            derived: true,
          };
        });
    }

    res.json({
      success: true,
      count: (history.length || derived.length),
      total: total || derived.length,
      data: history.length ? history : derived,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBudgets,
  getBudget,
  createBudget,
  updateBudget,
  deleteBudget,
  archiveBudget,
  getBudgetHistory,
};
