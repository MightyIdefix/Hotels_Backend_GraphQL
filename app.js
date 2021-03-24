require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors')
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const Schema = require('./api/src/schema/hotelschema');

//ESM i package.json

require('./models/db');
require('./models/hotel');
require('./models/user');
var userRouter = require('./routes/users');
var hotelRouter = require('./routes/hotels');
var roomsRouter = require('./routes/rooms');

// Swagger configuration
//import swaggerJSDoc from 'swagger-jsdoc';  // If using ES-modules
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Express API to manage users',
    version: '1.0.0',
    description: 'Swagger Demo for gruppe10 assignment 1.',
    license: {
      name: 'Licensed Under MIT',
      url: 'https://spdx.org/licenses/MIT.html',
    },
    contact: {
      name: 'Gruppe 10'
    },
    servers: [{
      url: 'http://localhost:3000',
      description: 'Development server',
    }, ],
  },
};

const options = {
  swaggerDefinition,
  // Paths to files containing OpenAPI definitions
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'public')));

app.use(cors());
app.use('/users', userRouter);
app.use('/hotels', hotelRouter);
app.use('/rooms', roomsRouter);
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/graphql', graphqlHTTP({
  schema: Schema,
  graphiql: true,
}));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json('Error: ' + (err.message || 'Internal server error'));
});

module.exports = app;
