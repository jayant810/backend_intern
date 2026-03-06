const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const rateLimit = require('express-rate-limit');

// Load env vars
dotenv.config();

const app = express();

// Rate limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 10 minutes'
});
app.use('/api/v1/auth', limiter);

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors({
    origin: '*',
    credentials: true
}));

// Route files
const auth = require('./routes/authRoutes');

// Mount routers
app.use('/api/v1/auth', auth);

// Basic home route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Task API' });
});

// Swagger Documentation
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Task Management API',
            version: '1.0.0',
            description: 'API for managing tasks with authentication and roles',
        },
        servers: [
            {
                url: 'http://localhost:5000',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
    apis: ['./src/routes/*.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

module.exports = app;
