const express = require('express');
const cors = require('cors');
const trimRequest = require('trim-request');
const passport = require('passport');
const path = require('path');
const morgan = require('morgan');

const { IMAGE_STORAGE, SWAGGER_BASE_URL } = require('../config/constant');
const { ServerError } = require('../app/util');
const { swaggerDocs } = require('./util');

const { userRouter } = require('./router/user');


const app = express();
app.use(passport.initialize());
app.use(cors());
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev': 'tiny'));
app.use(`/${IMAGE_STORAGE}`,express.static(path.resolve(`./${IMAGE_STORAGE}`)));
app.use(SWAGGER_BASE_URL, express.static(path.resolve(`.${SWAGGER_BASE_URL}`)));
app.use(express.json());

app.use(trimRequest.all);

app.get('/healthcheck', (req, res, next) => {
  res.json({ message: 'server is Up and Running!' });
});

app.use('/users', userRouter);

app.get('/swagger.json', (req, res) => {
  res.send(swaggerDocs(req, { url: process.env.SERVER_URL }));
});


// 404 handler
app.use('*', (req, res, next) => {
  next(new ServerError('API_NOT_FOUND', 404));
});

// error handler
app.use((err, req, res, next) => {
  if (!err.status) {
    console.error(err);
    process.exit(0);
  }
  console.log('Custom Server Error>', err.message);
  res.status(err.status).json({ message: err.message, status: err.status });
});

module.exports = {
  app
}
