require('dotenv').config();

const serverConfig = {
  PORT: process.env.PORT || 3000,
  IMAGE_FIELD: 'images',
  IMAGE_MAX_COUNT: process.env.IMAGE_MAX_COUNT,
  IMAGE_STORAGE: 'uploads/images/',
  SWAGGER_BASE_URL: '/public/api-docs',
  IMAGE_SIZE: 1000000,
  IMAGE_ACCEPTED: /jpeg|jpg|png|gif/,
  REFRESH_TOKEN_EXPIRY: '30d',
  ACCESS_TOKEN_EXPIRY: '15m',
  ACCESS_TOKEN_HEADER_NAME: 'x-access-token',
  REFRESH_TOKEN_HEADER_NAME: 'x-refresh-token',
}

module.exports = serverConfig;
