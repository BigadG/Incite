require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { router } = require('./routes');
const authMiddleware = require('./authMiddleware');
const process = require('process');
const path = require('path');

const app = express();

module.exports = app;