const express = require('express');
const router = express.Router();



const { 
    readLike, 
    createLike
  } = require('../controllers/commentVehicle_controller');

router
    .get('/', readLike)
    .post('/', createLike)
 

module.exports = router;