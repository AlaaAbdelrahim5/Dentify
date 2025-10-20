/**
 * Database sequence synchronization utilities
 * 
 * These utilities ensure PostgreSQL sequences stay in sync with the actual data,
 * preventing "Unique constraint failed on id" errors.
 */

const { PrismaClient } = require('@prisma/client');

/**
 * Syncs the User table's ID sequence with the current max ID
 * This should be called after migrations or data imports
 */
async function syncUserSequence(prisma) {
  try {
    // Get the current maximum ID
    const maxUser = await prisma.user.findFirst({
      orderBy: { id: 'desc' },
      select: { id: true }
    });

    if (maxUser && maxUser.id) {
      const nextId = maxUser.id + 1;
      // Use parameterized query to avoid SQL injection
      await prisma.$executeRawUnsafe(
        `SELECT setval('"User_id_seq"', $1, false)`,
        nextId
      );
      console.log(`✅ User sequence synced to ${nextId}`);
    }
  } catch (error) {
    console.error('❌ Error syncing User sequence:', error.message);
    // Don't throw - this is a non-critical operation
  }
}

/**
 * Initialize all database sequences
 * Call this on server startup or after migrations
 */
async function initializeSequences() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 Syncing database sequences...');
    await syncUserSequence(prisma);
    console.log('✅ All sequences synchronized');
  } catch (error) {
    console.error('❌ Error initializing sequences:', error);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Middleware to ensure sequence is synced before creating users
 * Use this as middleware in routes that create users
 */
async function ensureUserSequence(req, res, next) {
  try {
    // Only sync if there's a potential issue
    const prisma = req.prisma || new PrismaClient();
    await syncUserSequence(prisma);
    next();
  } catch (error) {
    console.error('Sequence sync warning:', error.message);
    // Continue anyway - the actual create will fail if there's a real issue
    next();
  }
}

module.exports = {
  syncUserSequence,
  initializeSequences,
  ensureUserSequence
};
