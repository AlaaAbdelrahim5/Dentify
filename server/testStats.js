const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testStats() {
  try {
    console.log('Testing stats query...\n');
    
    const total = await prisma.clinic.count();
    console.log('Total clinics:', total);
    
    const active = await prisma.user.count({
      where: {
        role: 'Clinic',
        status: 'ACTIVE'
      }
    });
    console.log('Active clinics:', active);
    
    const inactive = await prisma.user.count({
      where: {
        role: 'Clinic',
        status: {
          in: ['PENDING', 'DEACTIVATED', 'DELETED']
        }
      }
    });
    console.log('Inactive clinics:', inactive);
    
    console.log('\nResult:');
    console.log(JSON.stringify({
      success: true,
      data: {
        total,
        active,
        pending: inactive
      }
    }, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testStats();
