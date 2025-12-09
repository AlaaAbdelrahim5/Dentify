const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Migration script to convert file-based profile images to base64 in database
 * Run this once to migrate existing images
 */
async function migrateImagesToDatabase() {
  console.log('Starting image migration to database...');
  
  try {
    // Get all users with profile images
    const users = await prisma.user.findMany({
      where: {
        profileImage: {
          not: null
        }
      },
      select: {
        id: true,
        profileImage: true
      }
    });

    console.log(`Found ${users.length} users with profile images`);

    let migrated = 0;
    let skipped = 0;
    let errors = 0;

    for (const user of users) {
      try {
        // Skip if already base64
        if (user.profileImage.startsWith('data:')) {
          console.log(`User ${user.id}: Already migrated (base64 format), skipping`);
          skipped++;
          continue;
        }

        // Construct file path
        const filePath = path.join(__dirname, '..', user.profileImage);
        
        // Check if file exists
        if (!fs.existsSync(filePath)) {
          console.log(`User ${user.id}: File not found at ${filePath}, setting to null`);
          await prisma.user.update({
            where: { id: user.id },
            data: { profileImage: null }
          });
          errors++;
          continue;
        }

        // Read file and convert to base64
        const fileBuffer = fs.readFileSync(filePath);
        const ext = path.extname(filePath).toLowerCase();
        
        // Determine mime type
        let mimeType = 'image/jpeg';
        if (ext === '.png') mimeType = 'image/png';
        else if (ext === '.gif') mimeType = 'image/gif';
        else if (ext === '.webp') mimeType = 'image/webp';
        
        const base64Image = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;

        // Update user with base64 image
        await prisma.user.update({
          where: { id: user.id },
          data: { profileImage: base64Image }
        });

        console.log(`User ${user.id}: Successfully migrated image`);
        migrated++;
      } catch (error) {
        console.error(`User ${user.id}: Error migrating image:`, error.message);
        errors++;
      }
    }

    console.log('\n=== Migration Complete ===');
    console.log(`Successfully migrated: ${migrated}`);
    console.log(`Skipped (already base64): ${skipped}`);
    console.log(`Errors: ${errors}`);
    console.log('\nYou can now safely delete the /server/uploads/profiles directory');
    
  } catch (error) {
    console.error('Fatal error during migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
if (require.main === module) {
  migrateImagesToDatabase()
    .then(() => {
      console.log('Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateImagesToDatabase };
