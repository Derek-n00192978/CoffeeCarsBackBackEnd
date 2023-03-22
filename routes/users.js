const express = require('express');
const router = express.Router();
const imageUpload = require('../utils/image_Upload')
const { loginRequired } = require('../controllers/auth_controller');

const { 
    readData, 
    readOne,
    updateData,
    deleteData,
    register,
    login
  } = require('../controllers/user_controller');

router
    .get('/', readData)
    .get('/:id', loginRequired, readOne)
    .post('/register', register)
    .post('/login', login)
    
    .put('/:id/edit', loginRequired, imageUpload.single('image_path'), updateData)
    .delete('/:id', loginRequired, deleteData);

module.exports = router;