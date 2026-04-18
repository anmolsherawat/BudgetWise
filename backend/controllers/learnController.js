const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Toggle completion status for the current user
const toggleLesson = async (req, res) => {
    try {
        const { lessonId } = req.body;
        const user = await prisma.user.findUnique({
            where: { id: req.user.id }
        });

        const completedLessons = user.completedLessons || [];
        const isCompleted = completedLessons.includes(lessonId);
        
        const updatedLessons = isCompleted 
            ? completedLessons.filter(id => id !== lessonId)
            : [...completedLessons, lessonId];

        await prisma.user.update({
            where: { id: req.user.id },
            data: { completedLessons: updatedLessons }
        });

        res.json({ success: true, completedLessons: updatedLessons });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get stats for all lessons
const getStats = async (req, res) => {
    try {
        // Find total users
        let totalUsers = await prisma.user.count();
        // Fallback safety if empty database
        if (totalUsers === 0) totalUsers = 1;

        // Get all completed lessons data across all users
        const allUsers = await prisma.user.findMany({
            select: { completedLessons: true }
        });

        const stats = {};
        allUsers.forEach(user => {
            if (user.completedLessons) {
                user.completedLessons.forEach(lessonId => {
                    stats[lessonId] = (stats[lessonId] || 0) + 1;
                });
            }
        });

        let myCompleted = [];
        if (req.user?.id) {
            const user = await prisma.user.findUnique({ where: { id: req.user.id } });
            myCompleted = user?.completedLessons || [];
        }

        res.json({ success: true, totalUsers, stats, myCompleted });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { toggleLesson, getStats };
