import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FarmDirect Cloud API',
      version: '1.0.0',
      description: 'REST API for FarmDirect Cloud — connecting local farmers with consumers',
      contact: { name: 'FarmDirect', email: 'api@farmdirect.example.com' },
    },
    servers: [
      { url: 'http://localhost:5000', description: 'Development' },
      { url: process.env.API_BASE_URL || 'http://localhost:5000', description: 'Production' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token',
        },
      },
    },
    security: [{ bearerAuth: [] }, { cookieAuth: [] }],
  },
  apis: ['./src/routes/*.ts', './src/models/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
