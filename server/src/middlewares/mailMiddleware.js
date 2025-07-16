const nodemailer = require('nodemailer');
const catchAsync = require('../utils/catchAsync');
const logger = require('../utils/logger');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASSWORD,
  },
});

module.exports.sendMail = catchAsync(async (req, res, next) => {
  const { email, mailContent } = res.locals;

  const mailOptions = {
    to: email,
    ...mailContent,
  };

  await transporter.sendMail(mailOptions);

  logger.info(`Mail sent successfully to: ${email}`);

  if (res.locals.statusCode) return res.status(res.locals.statusCode).send();

  return next();
});
