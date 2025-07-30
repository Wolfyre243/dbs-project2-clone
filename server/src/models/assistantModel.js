const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

/**
 * Find or create a conversation for a user.
 */
module.exports.findOrCreateConversation = async (userId, exhibitId) => {
  let conversation = await prisma.conversation.findFirst({
    where: { userId, statusId: 1 },
  });
  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        userId,
        title: exhibitId
          ? `Exhibit ${exhibitId} Content Generation`
          : 'AI Content Generation',
        statusId: 1,
      },
    });
  }
  return conversation;
};

/**
 * Get senderTypeId by type string.
 */
module.exports.getSenderTypeId = async (senderType) => {
  const sender = await prisma.senderType.findFirst({ where: { senderType } });
  return sender?.senderTypeId;
};

/**
 * Create a message in a conversation.
 */
module.exports.createMessage = async (
  conversationId,
  senderTypeId,
  content,
) => {
  return prisma.message.create({
    data: {
      conversationId,
      senderTypeId,
      content,
      statusId: 1,
    },
  });
};
