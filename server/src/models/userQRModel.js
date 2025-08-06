// User QR statistics model

const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

/**
 * Aggregate user-specific QR scan statistics.
 * Returns: { totalQRScans, uniqueQRScanned, topVisitedExhibit }
 */
async function getUserQRStatistics(userId) {
  const totalQRScans = await prisma.event.count({
    where: { userId, eventType: { eventType: 'QR_SCANNED' } },
  });
  const uniqueQRScanned = await prisma.event.findMany({
    where: { userId, eventType: { eventType: 'QR_SCANNED' } },
    select: { entityId: true },
    distinct: ['entityId'],
  });

  // Top visited exhibit by scan count
  const qrEvents = await prisma.event.findMany({
    where: { userId, eventType: { eventType: 'QR_SCANNED' } },
    select: { entityId: true },
  });
  const exhibitScanMap = {};
  for (const event of qrEvents) {
    const exhibitId = event.entityId;
    if (!exhibitId) continue;
    exhibitScanMap[exhibitId] = (exhibitScanMap[exhibitId] || 0) + 1;
  }
  let topVisitedExhibit = null;
  if (Object.keys(exhibitScanMap).length > 0) {
    const topId = Object.entries(exhibitScanMap).sort(
      (a, b) => b[1] - a[1],
    )[0][0];
    const exhibit = await prisma.exhibit.findUnique({
      where: { exhibitId: topId },
      select: { exhibitId: true, title: true },
    });
    topVisitedExhibit = {
      exhibitId: exhibit.exhibitId,
      title: exhibit.title,
      scanCount: exhibitScanMap[topId],
    };
  }

  return {
    totalQRScans,
    uniqueQRScanned: uniqueQRScanned.length,
    topVisitedExhibit,
  };
}

module.exports = {
  getUserQRStatistics,
};
