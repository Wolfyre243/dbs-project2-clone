const statusCodes = require('../configs/statusCodes');
const { PrismaClient } = require('../generated/prisma');
const { convertDatesToStrings } = require('../utils/formatters');
const prisma = new PrismaClient();

/**
 * List all conversations for a user.
 */
module.exports.listConversations = async (userId) => {
  const conversations = await prisma.conversation.findMany({
    where: { userId, statusId: statusCodes.ACTIVE },
    orderBy: { modifiedAt: 'desc' },
    select: {
      conversationId: true,
      title: true,
      createdAt: true,
      modifiedAt: true,
    },
  });

  return convertDatesToStrings(conversations);
};

/**
 * Create a new conversation.
 */
module.exports.createConversation = async (userId, title) => {
  try {
    title = title.length > 100 ? title.slice(0, 100) : title;
    const conversation = await prisma.conversation.create({
      data: {
        userId,
        title: title || 'New Conversation',
        statusId: statusCodes.ACTIVE,
      },
      select: {
        conversationId: true,
        title: true,
        createdAt: true,
        modifiedAt: true,
      },
    });

    return conversation;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

/**
 * Get a conversation and its messages.
 */
module.exports.getConversation = async (userId, conversationId) => {
  const conversation = await prisma.conversation.findFirst({
    where: { conversationId, userId, statusId: statusCodes.ACTIVE },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
        select: {
          messageId: true,
          senderType: { select: { senderType: true } },
          content: true,
          createdAt: true,
        },
      },
    },
  });

  return {
    ...conversation,
    messages: conversation.messages.map((m) =>
      convertDatesToStrings({
        ...m,
        senderType: m.senderType.senderType,
      }),
    ),
  };
};

/**
 * List paginated messages for a conversation.
 */
module.exports.listMessages = async (
  userId,
  conversationId,
  page = 1,
  pageSize = 20,
) => {
  const skip = (page - 1) * pageSize;
  const messages = await prisma.message.findMany({
    where: {
      conversationId,
      conversation: { userId, statusId: statusCodes.ACTIVE },
      statusId: statusCodes.ACTIVE,
    },
    orderBy: { createdAt: 'asc' },
    skip,
    take: pageSize,
    select: {
      messageId: true,
      senderType: {
        select: {
          senderType: true,
        },
      },
      content: true,
      createdAt: true,
    },
  });

  const conversation = await prisma.conversation.findUnique({
    where: { conversationId },
  });

  return {
    messages: messages.map((m) =>
      convertDatesToStrings({ ...m, senderType: m.senderType.senderType }),
    ),
    conversation: convertDatesToStrings(conversation),
  };
};

/**
 * Create a message in a conversation.
 */
module.exports.createMessage = async (
  conversationId,
  senderTypeId,
  content,
) => {
  const message = prisma.message.create({
    data: {
      conversationId,
      senderTypeId,
      content,
      statusId: statusCodes.ACTIVE,
    },
  });

  return convertDatesToStrings(message);
};

/**
 * Soft delete a conversation and its messages.
 */
module.exports.deleteConversation = async (userId, conversationId) => {
  try {
    // Soft delete conversation
    const updated = await prisma.conversation.updateMany({
      where: { conversationId, userId, statusId: statusCodes.ACTIVE },
      data: { statusId: statusCodes.DELETED },
    });
    // Soft delete messages
    await prisma.message.updateMany({
      where: { conversationId, statusId: statusCodes.ACTIVE },
      data: { statusId: statusCodes.DELETED },
    });
    return updated.count > 0;
  } catch (error) {
    throw error;
  }
};

module.exports.getAllConversations = async ({
  page,
  pageSize,
  sortBy,
  order,
  search,
  filter,
  userId,
}) => {
  try {
    let where = {
      ...filter,
      userId,
      statusId: statusCodes.ACTIVE,
    };

    if (search && search.trim() !== '') {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { conversationId: { contains: search, mode: 'insensitive' } },
      ];
    }

    const conversationCount = await prisma.conversation.count({ where });

    const conversationList = await prisma.conversation.findMany({
      where,
      orderBy: { [sortBy]: order },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        conversationId: true,
        title: true,
        createdAt: true,
        modifiedAt: true,
      },
    });

    return {
      pageCount: Math.ceil(conversationCount / pageSize),
      conversationList: conversationList.map(convertDatesToStrings),
    };
  } catch (error) {
    throw error;
  }
};
