const prisma = require('./utils/prisma');

async function testAdmins() {
  try {
    console.log('🔍 Testing Admin Queries...\n');

    // Test 1: Count all admins
    const totalAdmins = await prisma.admin.count();
    console.log(`✅ Total Admins: ${totalAdmins}`);

    // Test 2: Count active admins
    const activeAdmins = await prisma.admin.count({
      where: {
        user: {
          status: 'ACTIVE'
        }
      }
    });
    console.log(`✅ Active Admins: ${activeAdmins}`);

    // Test 3: Fetch all admins with user data
    const admins = await prisma.admin.findMany({
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
        }
      },
      orderBy: {
        user: {
          createdAt: 'desc'
        }
      }
    });

    console.log(`\n📋 Admins List (${admins.length}):`);
    admins.forEach((admin, index) => {
      console.log(`\n${index + 1}. ${admin.firstName} ${admin.lastName}`);
      console.log(`   Email: ${admin.user.email}`);
      console.log(`   Phone: ${admin.user.phone || 'N/A'}`);
      console.log(`   Gender: ${admin.gender || 'N/A'}`);
      console.log(`   Status: ${admin.user.status}`);
    });

    console.log('\n✨ All tests completed successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testAdmins();
