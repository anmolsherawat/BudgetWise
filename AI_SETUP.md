# AI Integration Setup Guide

## Getting Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

## Setup Steps

1. **Add your Gemini API key to the backend `.env` file:**
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```

2. **Restart your backend server:**
   ```bash
   cd backend
   npm run dev
   ```

3. **Test the AI chatbot:**
   - Open your frontend application
   - Click on the Finance Helper (AI chatbot) button
   - Ask questions like:
     - "How am I doing with my budget this month?"
     - "What are my biggest expenses?"
     - "Give me some savings advice"
     - "How can I improve my financial health?"

## Features

The AI chatbot now:
- Analyzes your real financial data
- Provides personalized budget advice
- Gives insights on spending patterns
- Offers savings recommendations
- Answers general financial questions
- Uses your actual income, expenses, and budget data

## API Endpoint

- **POST** `/api/ai/chat`
- **Body:** `{ "message": "your question here" }`
- **Headers:** `Authorization: Bearer <your_jwt_token>`

## Example Questions to Try

- "Analyze my spending this month"
- "Am I over budget in any categories?"
- "How much am I saving this month?"
- "What's my biggest expense category?"
- "Give me tips to reduce my expenses"
- "How can I improve my budget?"