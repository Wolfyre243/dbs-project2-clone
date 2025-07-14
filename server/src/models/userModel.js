const { Prisma, PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();
const AppError = require("../utils/AppError");

module.exports.create = async (
  username,
  firstName,
  roleId,
  password = null,
  lastName = null,
) => {
  return prisma.users
    .create({
      data: {
        username: username,
        password: password,
        firstName: firstName,
        lastName: lastName,
        roleId: roleId,
      },
    })
    .then((user) => {
      return user;
    })
    .catch(function (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2002") {
          throw new AppError("Username already exists", 400);
        }
      }
      console.log(e);
      throw e;
    });
};
