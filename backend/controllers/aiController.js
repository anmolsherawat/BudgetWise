const { GoogleGenerativeAI } = require('@google/generative-ai');
const { prisma } = require('../config/database');

let genAI = null;
let model = null;

try {
  if (process.env.GOOGLE_AI_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    console.log('Google Generative AI initialized');
  } else {
    console.log('GOOGLE_AI_KEY not found in environment.');
  }
} catch (error) {
  console.error('Google Generative AI init failed:', error.message);
}

const getFinancialContext = async (userId) => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  try {
    // Get user's transactions for current month
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: new Date(currentYear, currentMonth - 1, 1),
          lt: new Date(currentYear, currentMonth, 1),
        },
      },
    });

    // Get user's budgets for current month
    const budgets = await prisma.budget.findMany({
      where: {
        userId,
        month: currentMonth,
        year: currentYear,
      },
    });

    // Calculate analytics
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const categoryBreakdown = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {});

    return {
      income,
      expenses,
      savings: income - expenses,
      budgets,
      categoryBreakdown,
      transactionCount: transactions.length,
    };
  } catch (error) {
    console.error('Error fetching financial context:', error);
    return {
      income: 0,
      expenses: 0,
      savings: 0,
      budgets: [],
      categoryBreakdown: {},
      transactionCount: 0,
    };
  }
};

const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
      });
    }

    // Mock response if AI service is not available (missing key)
    if (!model) {
      console.warn('AI service not init, returning mock response');
      return res.json({
        success: true,
        data: {
          message: "I'm running in demo mode because the GOOGLE_AI_KEY is not configured. Based on your mocked data, you seem to be doing great! (Please configure GOOGLE_AI_KEY in backend/.env for real AI responses)",
        },
      });
    }

    // Get user's financial context
    const financialData = await getFinancialContext(userId);

    // Get user info
    console.log('[DEBUG] AI Controller: Fetching user context for ID:', userId);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, currency: true },
    });

    // Create prompt for AI
    console.log('[DEBUG] AI Controller: Preparing prompt');
    const prompt = `
**You are Saurav Kumar Chat Bot, a highly versatile and intelligent AI assistant.**

**Your core directive is to provide short, crisp, and apt answers to any question a user asks, regardless of the topic.**

**Key Operational Directives:**

*   **Versatility**: You are capable of understanding and responding to queries across all domains, from general knowledge to specific technical questions.
*   **Conciseness**: Your responses MUST be brief and to the point. Avoid lengthy explanations or unnecessary details.
*   **Accuracy**: Ensure all information provided is factually correct and relevant to the question asked.
*   **Aptness**: Your answers should directly address the user's query without digression or generic statements. Provide the most pertinent information.
*   **Directness**: Get straight to the answer. Do not preface responses with phrases like "Finance is the study and management of money..." if the question is simply "What is finance?". Instead, directly state the definition or answer.

**Example Interactions:**

*   **User**: "How much did I spend on food in January?"
    **Saurav Kumar Chat Bot**: (Retrieves data) "In January, you spent $X on food."

*   **User**: "What is my current budget for entertainment?"
    **Saurav Kumar Chat Bot**: (Retrieves data) "Your current budget for entertainment is $Y."

*   **User**: "Tell me a joke."
    **Saurav Kumar Chat Bot**: "I can only answer questions related to finance-tracking."

*   **User**: "How many calories I have burnt?"
    **Saurav Kumar Chat Bot**: (If calories burnt is a financial metric in this context, retrieves data) "You have burnt Z calories."
    **Saurav Kumar Chat Bot**: (If calories burnt is NOT a financial metric) "I can only answer questions related to finance-tracking."

*   **User**: "What is the capital of France?"
    **Saurav Kumar Chat Bot**: "Paris."

*   **User**: "Explain photosynthesis in one sentence."
    **Saurav Kumar Chat Bot**: "Photosynthesis is the process by which green plants and some other organisms use sunlight to synthesize foods with the help of chlorophyll."

*   **User**: "Who wrote 'Romeo and Juliet'?"
    **Saurav Kumar Chat Bot**: "William Shakespeare."

*   **User**: "What is finance?"
    **Saurav Kumar Chat Bot**: "Finance is the management of money, credit, banking, and investments."

*   **User**: "How many calories I have burnt?"
    **Saurav Kumar Chat Bot**: "Please provide the context or data for me to calculate that."
---
**Current Context (Use this data to answer the user):**
- Name: ${user?.name || 'User'}
- Currency: ${user?.currency || 'USD'}
- Total Income (Month): ${financialData.income}
- Total Expenses (Month): ${financialData.expenses}
- Net Savings (Month): ${financialData.savings}
- Active Budgets: ${financialData.budgets.length > 0 ? financialData.budgets.map(b => `${b.category} (Limit: ${b.amount}, Spent: ${b.spent})`).join(' | ') : 'None'}
- Top Expense Categories: ${Object.entries(financialData.categoryBreakdown).sort(([, a], [, b]) => b - a).slice(0, 3).map(([cat, amt]) => `${cat}: ${amt}`).join(', ')}

**User's Message:** "${message}"
`;


    console.log('[DEBUG] AI Controller: Sending request to Gemini v2.5 Flash...');
    const result = await model.generateContent(prompt);
    console.log('[DEBUG] AI Controller: Gemini response received successfully');
    const aiResponse = result.response.text();

    res.json({
      success: true,
      data: {
        message: aiResponse,
      },
    });

  } catch (error) {
    console.error('AI Error:', error.message);
    // Graceful degradation on error
    res.json({
      success: true,
      data: {
        message: "I'm having trouble connecting to the AI service right now. Please try again later. (Error: " + error.message + ")",
      },
    });
  }
};

const generateCourse = async (req, res) => {
  try {
    if (!model) {
      return res.status(503).json({ success: false, message: 'AI service unavailable' });
    }
    const prompt = `Generate a comprehensive finance and investment course curriculum in JSON format.
The JSON must be an array of objects representing "levels".
Each level object must have exactly these keys:
- title (string): e.g., "Level 1: Capital Fundamentals"
- description (string)
- icon (string): choose one from ["FiLayers", "FiActivity", "FiTrendingUp", "FiCheckCircle", "FiStar"]
- lessons (array of objects)

Each lesson object must have exactly these keys:
- id (string): a unique identifier like "l1", "l2", etc.
- title (string)
- description (string)
- image (string): a URL to a real unspash image like "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=600&q=80"
- provider (string): e.g., "AI Academy" or "Wealth Mastery"
- status (string): "Available"
- deadline (string): a random date string like "Mar 2nd 2026, 11:56 am"
- multiplier (string): e.g., "2x", "4x"
- points (string): e.g., "0/40"
- content (array of strings): 3 highly detailed, well-written paragraphs teaching the financial concept.

Generate exactly 3 levels, each with exactly 2 professional lessons. Return ONLY valid JSON, do not wrap it in markdown codeblocks like \`\`\`json.`;

    console.log('[DEBUG] AI Controller: Requesting dynamic course generation...');
    const result = await model.generateContent(prompt);
    let aiResponse = result.response.text().trim();
    if (aiResponse.startsWith('\`\`\`json')) aiResponse = aiResponse.replace(/^\`\`\`json\s*/, '');
    if (aiResponse.startsWith('\`\`\`')) aiResponse = aiResponse.replace(/^\`\`\`\s*/, '');
    if (aiResponse.endsWith('\`\`\`')) aiResponse = aiResponse.replace(/\s*\`\`\`$/, '');

    const courseData = JSON.parse(aiResponse);
    res.json({ success: true, data: courseData });
  } catch (error) {
    console.error('Course Gen Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to generate course via AI' });
  }
};

module.exports = {
  chatWithAI,
  generateCourse,
};