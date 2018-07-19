"use strict";

const express = require('express'),
  CognitoExpress = require('cognito-express');

const logger = require('morgan');
const bodyParser = require('body-parser');

require('dotenv').config();

// Set's up the express app
const app = express(),
  // We are creating a second router for authenticated requests so far
authenticatedRoute = express.Router();

app.use("/api", authenticatedRoute);

const cors = require('cors');

// Logs requests to the console
app.use(logger('dev'));

app.use(cors());

authenticatedRoute.use(cors());

// Parse incoming requests data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const cognitoExpress = new CognitoExpress({
  region: process.env.awsRegion,
  cognitoUserPoolId: process.env.userPoolId,
  tokenUse: "access",
  tokenExpiration: 3600000
});

authenticatedRoute.use(function(req, res, next) {
  // Passing in the access token in header under key accessToken
  let accessTokenFromClient = req.headers['x-access-token'];

  // Fail if token not present in header.
  if (!accessTokenFromClient) return res.status(401).send("Access Token missing - Please Login");

  cognitoExpress.validate(accessTokenFromClient, function(err, response) {
    //If API not authenticated, return 401
    if (err) return res.status(401).send(err);
    // else API has been authenticated. Proceed.
    res.locals.user = response;
    // console.log(response);
    next();
  });
});

// Define your routes that need authentication check
require('./server/routes')(app);
app.get('/', (req, res) => res.status(200).send({
    message: 'This route is not protected by authentication, and will return JSON for public consumption.',
  }));

authenticatedRoute.get("/myfirstapi", function(req, res, next) {
  res.send('Hi! If you are receiving this message, your API call is authenticated through a Cognito User Token.');
});

module.exports = app;
