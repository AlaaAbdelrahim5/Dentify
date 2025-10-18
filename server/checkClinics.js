const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkClinics() {
  try {
    console.log('Fetching all clinics...');
    const clinics = await prisma.clinic.findMany({
      include: {
        user: true,
        dentists: true,
        secretaries: true
      }
    });
    
    console.log('Total clinics in database:', clinics.length);
    console.log('\nClinics data:');
    console.log(JSON.stringify(clinics, null, 2));
  } catch (error) {
    console.error('Error:', error);
    console.error('Error message:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkClinics();
