const express = require('express');
const { index, StoreImage } = require('../../controllers/firebase');
const firebase_routes = express.Router();
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() }); 

firebase_routes.get('/', index);
firebase_routes.post('/create', upload.array('file'), StoreImage);

module.exports = firebase_routes;
