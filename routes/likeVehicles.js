const express = require('express');
const router = express.Router();



const { 
    readLike, 
    createLike
  } = require('../controllers/likeVehicle_controller');

router
    .get('/', readLike)
router
    .post('/', createLike)
 

module.exports = router;