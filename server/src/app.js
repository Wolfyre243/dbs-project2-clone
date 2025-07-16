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
    servers: [{ url: `http://localhost:3000` }],
  },
  apis: ['./routes/*.js'], // Path to your API docs
};

let swaggerDocs;
try {
  swaggerDocs = swaggerJsDoc(swaggerOptions);
} catch (error) {
  console.error('swagger-jsdoc error:', error);
}

//----------------------------SET UP APP--------------------------------
// Create server
const app = express();

// Read cookies
app.use(cookieParser(cookieOptions));

app.use(
  cors({
    origin: [`http://localhost:${process.env.FRONTEND_PORT}`],
    credentials: true,
  }),
);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// HELMET
app.use(helmet());
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      connectSrc: ["'self'"],
    },
  }),
);

app.use((req, res, next) => {
  const start = Date.now();

  // Wrap res.end to set the header just before the response is sent
  const originalEnd = res.end;
  res.end = function (...args) {
    const duration = Date.now() - start;
    res.setHeader('X-Response-Time', `${duration}`);
    originalEnd.apply(res, args);
  };

  return next();
});

app.use(loggerMiddleware);

// Main routes
app.use('/', mainRouter);

app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

// Redirect the user if they try to access the main page
app.get('/', (req, res) => {
  res.redirect('/docs');
});

// Handle nonexistent routes
app.use(notFound);

// Global error handling middleware
app.use(errorHandler);

// Output Sanitization Middleware
app.use(outputSanitize);

// Export server
module.exports = app;
