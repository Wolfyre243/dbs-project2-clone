//------------------------------IMPORT---------------------------------
// Import dependencies
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');

const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

// Import Routes
const mainRouter = require('./routes/mainRoutes');

const { cookieOptions } = require('./configs/authConfig');
const loggerMiddleware = require('./middlewares/loggerMiddleware');
const outputSanitize = require('./middlewares/sanitizeOutput');

const swaggerUI = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

// Configure swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SDC Exhibition App',
      version: '1.0.0',
      description: 'API documentation using Swagger',
    },
    servers: [{ url: `http://localhost:${process.env.PORT}` }],
  },
  apis: ['./src/routes/*.js'],
};

let swaggerDocs;
try {
  swaggerDocs = swaggerJsDoc(swaggerOptions);
  console.log('Swagger docs generated successfully');
  console.log(
    'Number of paths found:',
    Object.keys(swaggerDocs.paths || {}).length,
  );
} catch (error) {
  console.error('swagger-jsdoc error:', error);
  swaggerDocs = null;
}

const FRONTEND_URL =
  process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_PROD_URL
    : process.env.FRONTEND_URL;

//----------------------------SET UP APP--------------------------------
// Create server
const app = express();

app.use(cookieParser(cookieOptions));

app.use(
  cors({
    origin: [FRONTEND_URL],
    credentials: true,
  }),
);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// HELMET with CSP configuration for Swagger UI
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        connectSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  }),
);

app.use((req, res, next) => {
  const start = Date.now();
  req.startTime = start;

  // Set response time header when response finishes
  res.on('finish', () => {
    const duration = Date.now() - start;
    res.setHeader('X-Response-Time', `${duration}`);
  });

  next();
});

app.use(loggerMiddleware);

app.use(outputSanitize);

app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

app.use('/', mainRouter);

// Handle nonexistent routes
app.use(notFound);

// Global error handling middleware (should be last)
app.use(errorHandler);

// Export server
module.exports = app;
