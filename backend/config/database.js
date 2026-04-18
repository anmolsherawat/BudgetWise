const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('Prisma connected to MongoDB Atlas');
  } catch (error) {
    console.error(`Prisma Connection Error: ${error.message}`);
    console.error('Please check your MONGODB_URI in backend/.env');
  }
};

const disconnectDB = async () => {
  await prisma.$disconnect();
  console.log('Prisma disconnected');
};

module.exports = { prisma, connectDB, disconnectDB };