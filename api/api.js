
const bodyParser = require('body-parser');
const express = require('express');
const helmet = require('helmet');
const http = require('http');
const mapRoutes = require('express-routes-mapper');
const cors = require('cors');
const path = require('path');
const fileUpload = require('express-fileupload')
require('dotenv').config();

const config = require('../config/');
const dbService = require('./services/db.service');
// const environment = "development"; 
const environment = process.env.NODE_ENV; 
console.log(environment,"environment")

const app = express();
app.use(fileUpload());

const server = http.Server(app)

const mappedOpenRoutes = mapRoutes(config.Routes, 'api/controllers/');


const DB = dbService(environment, config.migrate).start();

const corsOpts = {
  origin: '*',

  methods: [
    'GET',
    'POST',
    'PUT',
    'DELETE'
  ],

  allowedHeaders: [
    'Content-Type',
  ],
};

app.use(cors(corsOpts));

app.use(helmet({
  dnsPrefetchControl: false,
  frameguard: false,
  ieNoOpen: false,
}));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/api', mappedOpenRoutes);


//app.use('/api', mappedOpenRoutes);
server.listen(config.port, () => {

  if (environment !== 'production' && environment !== 'development' && environment !== 'testing') {
    console.error(`NODE_ENV is set to ${environment}, but only production and development are valid`);
    process.exit(1);
  }
  console.log("connection to db ")
  return DB;
});

