const express = require('express');
const router = express.Router();
const imageUpload = require('../utils/image_Upload')
const { loginRequired } = require('../controllers/auth_controller');


const { 
    readData, 
    readOne,
    createData,
    updateData,
    deleteData
  } = require('../controllers/vehicle_controller');

  const { 
    readLike,
    getUsersThatLiked
  } = require('../controllers/likeVehicle_controller');

router
    .get('/', readData)
    .get('/liked', loginRequired, readLike)
    .get('/:id', loginRequired, readOne)
    .get('/:id/likedBy', loginRequired, getUsersThatLiked)
    .post('/', loginRequired, imageUpload.single('image_path'), createData)
    .put('/:id/edit', loginRequired, imageUpload.single('image_path'), updateData)
    .delete('/:id', loginRequired, deleteData);

module.exports = router;