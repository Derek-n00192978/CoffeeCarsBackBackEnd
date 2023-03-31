const express = require('express');
const router = express.Router();



const { 
    readLike, 
   
  } = require('../controllers/likeEvent_controller');

router
    .get('/', readLike)
  

module.exports = router;