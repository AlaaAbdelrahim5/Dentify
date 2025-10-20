const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixUserSequence() {
  try {
    console.log('Fixing User ID sequence...');

    // Get the maximum user ID
    const maxUser = await prisma.user.findFirst({
      orderBy: {
        id: 'desc'
      },
      select: {
        id: true
      }
    });

    if (maxUser) {
      console.log(`Current max User ID: ${maxUser.id}`);
      
      // Reset the sequence to the next available ID
      const nextId = maxUser.id + 1;
      
      await prisma.$executeRawUnsafe(
        `ALTER SEQUENCE "User_id_seq" RESTART WITH ${nextId}`
      );
      
      console.log(`✅ User ID sequence reset to ${nextId}`);
    } else {
      console.log('No users found, resetting sequence to 1');
      await prisma.$executeRawUnsafe(
        `ALTER SEQUENCE "User_id_seq" RESTART WITH 1`
      );
    }

    console.log('✅ Sequence fixed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing sequence:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixUserSequence();
