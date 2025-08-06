// User audio statistics model

const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

/**
 * Aggregate user-specific audio statistics.
 * Returns: { totalAudioPlays, totalAudioCompletions }
 */
async function getUserAudioStatistics(userId) {
  const totalAudioPlays = await prisma.event.count({
    where: { userId, eventType: { eventType: 'AUDIO_STARTED' } },
  });
  const totalAudioCompletions = await prisma.event.count({
    where: { userId, eventType: { eventType: 'AUDIO_COMPLETED' } },
  });
  return {
    totalAudioPlays,
    totalAudioCompletions,
  };
}

module.exports = {
  getUserAudioStatistics,
};
