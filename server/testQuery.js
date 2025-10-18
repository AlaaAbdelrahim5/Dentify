const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testQuery() {
  try {
    console.log('Testing the exact query from the GET endpoint...\n');
    
    const whereClause = { AND: [] };
    const finalWhere = whereClause.AND.length > 0 ? whereClause : {};
    
    console.log('Where clause:', JSON.stringify(finalWhere, null, 2));
    
    const total = await prisma.clinic.count({ where: finalWhere });
    console.log('Total count:', total);
    
    const clinics = await prisma.clinic.findMany({
      where: finalWhere,
      skip: 0,
      take: 10,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            status: true,
            profileImage: true,
            createdAt: true,
            updatedAt: true
          }
        },
        dentists: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            specialization: true,
            user: {
              select: {
                status: true
              }
            }
          }
        },
        secretaries: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            user: {
              select: {
                status: true
              }
            }
          }
        }
      },
      orderBy: {
        userId: 'desc'
      }
    });
    
    console.log('\nFetched clinics:', clinics.length);
    console.log(JSON.stringify(clinics, null, 2));
    
  } catch (error) {
    console.error('ERROR:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testQuery();
