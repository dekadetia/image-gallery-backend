const express = require('express');
const firebase_routes = express.Router();
const multer = require('multer');

const { index, StoreImage } = require('../../controllers/firebase');
const { UpdateImage } = require('../../controllers/firebase/update/update');
const { GET_IMAGES, GET_ALL_IMAGES, GET_ALL_IMAGES_A_Z, GET_RANDOM_IMAGES, GET_SINGLE_FILE, GET_ORDERED_IMAGES, getCount } = require('../../controllers/firebase/fetch/fetch');
const { DeleteImage } = require('../../controllers/firebase/delete/delete');

const upload = multer({ storage: multer.memoryStorage() }); 

firebase_routes.get('/', index);
firebase_routes.post('/create', upload.array('file'), StoreImage);
firebase_routes.post('/update', UpdateImage);
firebase_routes.delete('/delete', DeleteImage);
firebase_routes.post('/get-images', GET_IMAGES);
firebase_routes.post('/get-all-images', GET_ALL_IMAGES);
firebase_routes.post('/get-sorted-images', GET_ALL_IMAGES_A_Z);
firebase_routes.get('/get-random-images', GET_RANDOM_IMAGES);
firebase_routes.post('/get-single-image', GET_SINGLE_FILE);
firebase_routes.post('/get-ordered-images', GET_ORDERED_IMAGES);
firebase_routes.get('/get-count', getCount);

module.exports = firebase_routes;
