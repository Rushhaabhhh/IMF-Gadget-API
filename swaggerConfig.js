const swaggerJsDoc = require('swagger-jsdoc');

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'API Information',
    },
    components: {
      schemas: {
        Task: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Unique identifier for the task',
            },
            title: {
              type: 'string',
              description: 'Title of the task',
            },
            description: {
              type: 'string',
              description: 'Description of the task',
            },
            status: {
              type: 'string',
              enum: ['Todo', 'In Progress', 'Done'],
              description: 'Status of the task',
            },
            priority: {
              type: 'string',
              enum: ['Low', 'Medium', 'High'],
              description: 'Priority level of the task',
            },
            dueDate: {
              type: 'string',
              format: 'date',
              description: 'Due date for the task',
            },
            userId: {
              type: 'string',
              description: 'ID of the user assigned to this task',
            },
          },
          required: ['title', 'status', 'priority'],
        },
      },
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  apis: ['./Routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = swaggerDocs;