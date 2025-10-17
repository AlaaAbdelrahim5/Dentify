const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanupIncompleteUsers() {
  try {
    console.log('🔍 Checking for incomplete user records...');
    
    // Find users with Patient role but no patient profile
    const users = await prisma.user.findMany({
      where: {
        role: 'Patient'
      },
      include: {
        patient: true
      }
    });

    const incompleteUsers = users.filter(user => !user.patient);
    
    if (incompleteUsers.length === 0) {
      console.log('✅ No incomplete user records found.');
      return;
    }

    console.log(`⚠️  Found ${incompleteUsers.length} incomplete user(s):`);
    incompleteUsers.forEach(user => {
      console.log(`   - ID: ${user.id}, Email: ${user.email}`);
    });

    // Delete incomplete users
    for (const user of incompleteUsers) {
      await prisma.user.delete({
        where: { id: user.id }
      });
      console.log(`🗑️  Deleted incomplete user: ${user.email}`);
    }

    console.log('✅ Cleanup completed successfully!');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupIncompleteUsers();
