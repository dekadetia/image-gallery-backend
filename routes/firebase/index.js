const express = require('express');
const firebase_routes = express.Router();
const multer = require('multer');

const { index, StoreImage } = require('../../controllers/firebase');
const { UpdateImage } = require('../../controllers/firebase/update/update');
const { GET_IMAGES, GET_ALL_IMAGES, GET_ALL_IMAGES_A_Z, GET_RANDOM_IMAGES } = require('../../controllers/firebase/fetch/fetch');

const upload = multer({ storage: multer.memoryStorage() }); 

firebase_routes.get('/', index);
firebase_routes.post('/create', upload.array('file'), StoreImage);
firebase_routes.post('/update', upload.single('file'), UpdateImage);

module.exports = firebase_routes;
