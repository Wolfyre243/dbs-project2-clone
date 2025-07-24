const statusCodes = require('../configs/statusCodes');
const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();

// Fetch active languages
module.exports.getActiveLanguages = async () => {
  const languagesArr = await prisma.language.findMany({
    where: { statusId: statusCodes.ACTIVE },
    select: { languageCode: true },
  });
  // console.log(languagesArr);
  return languagesArr.map((lang) => lang.languageCode);
};
