// NOTE: This seeding script was made with the help of AI (Cline) 😄
require('dotenv').config();

const Roles = require('../src/configs/roleConfig');
const { PrismaClient } = require('../src/generated/prisma');
const bcrypt = require('bcrypt');
const { encryptData } = require('../src/utils/encryption');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Step 1: Seed Status Records
    console.log('📊 Step 1: Creating status records...');
    const statusData = [
      { statusName: 'Active' },
      { statusName: 'Suspended' },
      { statusName: 'Deleted' },
      { statusName: 'Published' },
      { statusName: 'Pending' },
      { statusName: 'Archived' },
      { statusName: 'Verified' },
    ];

    if (statusData.length > 0) {
      const createdStatuses = await prisma.status.createMany({
        data: statusData,
        skipDuplicates: true,
      });
      console.log(`   ✅ Created ${createdStatuses.count} status records`);

      const activeStatusId = (
        await prisma.status.findFirst({
          where: { statusName: 'Active' },
          select: {
            statusId: true,
          },
        })
      )['statusId'];

      if (!activeStatusId) {
        throw new Error(
          'Active status not found. Please ensure you have an "Active" status in your statusData.',
        );
      }

      // Step 2: Seed Role Records
      console.log('\n👤 Step 2: Creating role records...');
      const roleData = [
        {
          roleName: 'GUEST',
          description: 'A guest user, data does not save',
          statusId: activeStatusId,
        },
        {
          roleName: 'MEMBER',
          description: 'A member user, has an account with SDC',
          statusId: activeStatusId,
        },
        {
          roleName: 'ADMIN',
          description: 'An admin user, can manage content and view users',
          statusId: activeStatusId,
        },
        {
          roleName: 'SUPERADMIN',
          description: 'A superadmin user, has the highest privileges',
          statusId: activeStatusId,
        },
      ];

      if (roleData.length > 0) {
        const createdRoles = await prisma.role.createMany({
          data: roleData,
          skipDuplicates: true,
        });
        console.log(`   ✅ Created ${createdRoles.count} role records`);
      }

      // Step 3: Seed Language Records
      console.log('\n🌍 Step 3: Creating language records...');
      const languageData = [
        {
          languageCode: 'en-GB',
          languageName: 'English',
          statusId: activeStatusId,
        },
        {
          languageCode: 'cmn-CN',
          languageName: 'Chinese',
          statusId: activeStatusId,
        },
        {
          languageCode: 'es-ES',
          languageName: 'Spanish',
          statusId: activeStatusId,
        },
        {
          languageCode: 'fr-FR',
          languageName: 'French',
          statusId: activeStatusId,
        },
        {
          languageCode: 'de-DE',
          languageName: 'German',
          statusId: activeStatusId,
        },
        {
          languageCode: 'ja-JP',
          languageName: 'Japanese',
          statusId: activeStatusId,
        },
        {
          languageCode: 'ru-RU',
          languageName: 'Russian',
          statusId: activeStatusId,
        },
        {
          languageCode: 'it-IT',
          languageName: 'Italian',
          statusId: activeStatusId,
        },
        {
          languageCode: 'ko-KR',
          languageName: 'Korean',
          statusId: activeStatusId,
        },
        {
          languageCode: 'ms-MY',
          languageName: 'Malay',
          statusId: activeStatusId,
        },
        {
          languageCode: 'ta-IN',
          languageName: 'Tamil',
          statusId: activeStatusId,
        },
        {
          languageCode: 'hi-IN',
          languageName: 'Hindi',
          statusId: activeStatusId,
        },
      ];

      if (languageData.length > 0) {
        const createdLanguages = await prisma.language.createMany({
          data: languageData,
          skipDuplicates: true,
        });
        console.log(`   ✅ Created ${createdLanguages.count} language records`);
      }

      // Step 4: Seed Audit Action Records
      console.log('\n📝 Step 4: Creating audit action records...');
      const auditActionData = [
        { actionType: 'CREATE', description: 'Record created' },
        { actionType: 'READ', description: 'Record accessed/viewed' },
        { actionType: 'UPDATE', description: 'Record updated' },
        { actionType: 'DELETE', description: 'Record deleted (soft or hard)' },
      ];

      if (auditActionData.length > 0) {
        const createdAuditActions = await prisma.auditAction.createMany({
          data: auditActionData,
          skipDuplicates: true,
        });
        console.log(
          `   ✅ Created ${createdAuditActions.count} audit action records`,
        );
      }

      // Step 4.1: Seed Event Type Records
      console.log('\n🎫 Step 4.1: Creating event type records...');
      const eventTypeData = [
        {
          eventType: 'QR_SCANNED',
          description: 'Event triggered when a QR code is scanned',
        },
        {
          eventType: 'AUDIO_STARTED',
          description: 'Audio playback started by user',
        },
        {
          eventType: 'AUDIO_PAUSED',
          description: 'Audio playback paused by user',
        },
        {
          eventType: 'AUDIO_STOPPED',
          description: 'Audio playback stopped by user',
        },
        {
          eventType: 'AUDIO_SEEKED',
          description: 'User jumped to a different position in the audio',
        },
        {
          eventType: 'AUDIO_COMPLETED',
          description: 'Audio playback completed (reached end)',
        },
        {
          eventType: 'AUDIO_VOLUME_CHANGED',
          description: 'User changed the audio volume',
        },
        {
          eventType: 'AUDIO_MUTED',
          description: 'User muted the audio',
        },
        {
          eventType: 'AUDIO_UNMUTED',
          description: 'User unmuted the audio',
        },
      ];

      if (eventTypeData.length > 0) {
        const createdEventTypes = await prisma.eventType.createMany({
          data: eventTypeData,
          skipDuplicates: true,
        });
        console.log(
          `   ✅ Created ${createdEventTypes.count} event type records`,
        );
      }

      // Step 5: Seed User Records
      console.log('\n👥 Step 5: Creating user records...');
      const userData = [
        { username: 'superidol', statusId: activeStatusId },
        { username: 'admin', statusId: activeStatusId },
      ];

      if (userData.length > 0) {
        const createdUsers = await prisma.users.createMany({
          data: userData,
          skipDuplicates: true,
        });
        console.log(`   ✅ Created ${createdUsers.count} user records`);

        const allUsers = await prisma.users.findMany({
          where: {
            username: { in: userData.map((u) => u.username) },
          },
        });

        // Step 6: Seed User Profile Records
        console.log('\n📋 Step 6: Creating user profile records...');
        const userProfileData = [
          {
            userId: allUsers.find((u) => u.username === 'superidol').userId,
            firstName: 'John',
            lastName: 'Doe',
            languageCode: 'en-GB',
            gender: 'M',
            dob: new Date('2007-12-13'),
            modifiedBy: allUsers.find((u) => u.username === 'superidol').userId,
            statusId: activeStatusId,
          },
          {
            userId: allUsers.find((u) => u.username === 'admin').userId,
            firstName: 'Ed',
            lastName: 'Mean',
            languageCode: 'en-GB',
            gender: 'M',
            dob: new Date('1999-10-21'),
            modifiedBy: allUsers.find((u) => u.username === 'admin').userId,
            statusId: activeStatusId,
          },
        ];

        if (userProfileData.length > 0) {
          const createdProfiles = await prisma.userProfile.createMany({
            data: userProfileData,
            skipDuplicates: true,
          });
          console.log(
            `   ✅ Created ${createdProfiles.count} user profile records`,
          );
        }

        // Step 7: Seed User Role Assignments
        console.log('\n🔐 Step 7: Assigning roles to users...');

        const userRoleData = [
          {
            userId: allUsers.find((u) => u.username === 'superidol').userId,
            roleId: Roles.SUPERADMIN,
          },
          {
            userId: allUsers.find((u) => u.username === 'admin').userId,
            roleId: Roles.ADMIN,
          },
        ];

        if (userRoleData.length > 0) {
          const createdUserRoles = await prisma.userRole.createMany({
            data: userRoleData,
            skipDuplicates: true,
          });
          console.log(
            `   ✅ Created ${createdUserRoles.count} user role assignments`,
          );
        }

        // Step 8: Seed Email Records
        console.log('\n📧 Step 8: Creating email records...');
        const emailData = [
          {
            userId: allUsers.find((u) => u.username === 'superidol').userId,
            email: encryptData('wolfyreblueflare@gmail.com'),
            isPrimary: true,
            statusId: activeStatusId,
          },
          {
            userId: allUsers.find((u) => u.username === 'admin').userId,
            email: encryptData('admin@gmail.com'),
            isPrimary: true,
            statusId: activeStatusId,
          },
        ];

        if (emailData.length > 0) {
          const createdEmails = await prisma.email.createMany({
            data: emailData,
            skipDuplicates: true,
          });
          console.log(`   ✅ Created ${createdEmails.count} email records`);
        }

        // Step 9: Seed Password Records
        // WONTFIX: Password will be duplicated on re-seeding due to no unique constraints, delete them in the db first
        console.log('\n🔒 Step 9: Creating password records...');
        const passwordData = [
          { username: 'superidol', plainPassword: 'Password123!' },
          { username: 'admin', plainPassword: 'Password123!' },
        ];

        if (passwordData.length > 0) {
          const hashedPasswordData = [];
          for (const passwordInfo of passwordData) {
            const user = allUsers.find(
              (u) => u.username === passwordInfo.username,
            );
            if (user) {
              const hashedPassword = await bcrypt.hashSync(
                passwordInfo.plainPassword,
                parseInt(process.env.BCRYPT_SALTROUNDS),
              );
              hashedPasswordData.push({
                userId: user.userId,
                password: hashedPassword,
                isActive: true,
              });
            }
          }

          if (hashedPasswordData.length > 0) {
            const createdPasswords = await prisma.password.createMany({
              data: hashedPasswordData,
              skipDuplicates: true,
            });
            console.log(
              `   ✅ Created ${createdPasswords.count} password records`,
            );
          }
        }

        console.log('\n🎉 Database seeding completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`   - Statuses: ${statusData.length}`);
        console.log(`   - Roles: ${roleData.length}`);
        console.log(`   - Languages: ${languageData.length}`);
        console.log(`   - Audit Actions: ${auditActionData.length}`);
        console.log(`   - Users: ${userData.length}`);
        console.log(`   - User Profiles: ${userProfileData.length}`);
        console.log(`   - User Roles: ${userRoleData.length}`);
        console.log(`   - Emails: ${emailData.length}`);
        console.log(`   - Passwords: ${passwordData.length}`);
      }
    } else {
      console.log(
        '   ⚠️  No status data provided. Please fill in the statusData array to continue.',
      );
    }
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
