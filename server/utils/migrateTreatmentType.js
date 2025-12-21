const prisma = require('./prisma');

async function migrateTreatmentTypeToName() {
  try {
    console.log('Starting migration from treatmentType to treatmentName...');

    // Get all treatments with treatmentType
    const treatments = await prisma.treatment.findMany({
      where: {
        treatmentType: { not: null }
      },
      select: {
        id: true,
        treatmentType: true,
        treatmentName: true
      }
    });

    console.log(`Found ${treatments.length} treatments to migrate`);

    // Update each treatment
    let migrated = 0;
    for (const treatment of treatments) {
      if (!treatment.treatmentName && treatment.treatmentType) {
        await prisma.treatment.update({
          where: { id: treatment.id },
          data: { treatmentName: treatment.treatmentType }
        });
        migrated++;
      }
    }

    console.log(`Successfully migrated ${migrated} treatments`);
    console.log('Migration completed!');

  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateTreatmentTypeToName()
  .catch(console.error);
