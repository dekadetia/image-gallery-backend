const express = require('express');
const { index, StoreImage } = require('../../controllers/firebase');
const firebase_routes = express.Router();

firebase_routes.post('/', index);
firebase_routes.post('/create', StoreImage);

module.exports = firebase_routes;
