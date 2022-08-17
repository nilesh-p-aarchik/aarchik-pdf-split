
const Routes = require('./routes/publicRoutes');

const config = {
  migrate: true,
  Routes,
  port: process.env.PORT || '8080',
};

module.exports = config;
