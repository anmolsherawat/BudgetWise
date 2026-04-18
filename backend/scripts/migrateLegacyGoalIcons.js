/**
 * One-time migration: replace ONLY the old Prisma default goal icon (U+1F3AF)
 * with the ASCII sentinel "target".
 *
 * Does NOT change:
 * - Any other icon string (including other emojis the user may have saved)
 * - Titles, amounts, or any other fields
 *
 * Run: npm run migrate:goal-icons (from backend/)
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { prisma, connectDB, disconnectDB } = require('../config/database');

// Legacy @default before schema change; keep as codepoint to avoid emoji literals in source
const LEGACY_PRISMA_DEFAULT_ICON = String.fromCodePoint(0x1f3af);
const REPLACEMENT_ICON = 'target';

async function main() {
  await connectDB();

  const result = await prisma.goal.updateMany({
    where: { icon: LEGACY_PRISMA_DEFAULT_ICON },
    data: { icon: REPLACEMENT_ICON },
  });

  console.log(
    `migrateLegacyGoalIcons: updated ${result.count} goal(s) where icon matched legacy default only.`
  );

  await disconnectDB();
}

main().catch(async (err) => {
  console.error('migrateLegacyGoalIcons failed:', err);
  try {
    await disconnectDB();
  } catch (_) {
    /* ignore */
  }
  process.exit(1);
});
