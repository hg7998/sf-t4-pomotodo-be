'use strict';
const serverless = require('serverless-http');
const App = require('./app');
const app = new App();

module.exports.hello = serverless(app);
