const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixSequence() {
  try {
    console.log('Fixing User table ID sequence...');
    
    // Get the current max ID
    const maxUser = await prisma.user.findFirst({
      orderBy: { id: 'desc' },
      select: { id: true }
    });
    
    const maxId = maxUser ? maxUser.id : 0;
    console.log(`Current max User ID: ${maxId}`);
    
    // Reset the sequence to the next available ID
    await prisma.$executeRawUnsafe(`
      SELECT setval(pg_get_serial_sequence('"User"', 'id'), ${maxId + 1}, false);
    `);
    
    console.log(`Sequence reset to ${maxId + 1}`);
    console.log('✓ Sequence fixed successfully!');
    
  } catch (error) {
    console.error('Error fixing sequence:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixSequence();
