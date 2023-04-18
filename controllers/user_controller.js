const User = require('../controllers/models/user_schema.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const LikeVehicle = require('../controllers/models/like_vehicle_schema');

const fs = require('fs');
const deleteImage = async (filename) => {
    if(process.env.STORAGE_ENGINE === 'S3'){
        const {S3Client, DeleteObjectCommand} = require('@aws-sdk/client-s3')
        const s3 = new S3Client({
            region: process.env.MY_AWS_REGION,
            credentials: {
                accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY
            }
        });
        try {
            const data = await s3.send(new DeleteObjectCommand({ Bucket: process.env.MY_AWS_BUCKET, key: filename}));
            console.log("Sucess")
        }
        catch(err) {
            console.log("Error", err)
        }
    }
    else{
        let path = `public${process.env.MY_STATIC_FILES_URL}${filename}`;
        fs.access(path, fs.F_OK, (err) => {
            if(err){
                console.error(err);
                return;
            }
    
            fs.unlink(path, (err) => {
                if(err) throw err;
                console.log(`${filename} was deleted`);
            });
        });
    }
};
const readData = (req, res) => {
    User.find().populate('vehicles').populate('likes')
            .then((data) => {
                console.log(data);
                if(data.length > 0){
                    res.status(200).json(data);
                }
                else{
                    res.status(404).json("None found");
                }
            })
            .catch((err) => {
                console.log(err);
                res.status(500).json(err);
            });
    // res.status(200).json({
    //     "msg" : "All User retrieved"
    // });
};

const readAuth = (req, res) => {

    // let id = req.params.id;
    let id = req.user._id;

    // console.log(req.user);

    // connect to db and retrieve User with :id

    User.findById(id).populate('vehicles').populate({
        path: 'likes',
        populate: { path: 'vehicle_id'}
    })
    .then((user) => {
        if(user){
            let img = `${process.env.STATIC_FILES_URL}${user.image_path}`;
            user.image_path = img;

            res.status(200).json(user);

           
        }
        else{
            res.status(404).json({
                "msg": `User with id: ${id} not found`
            });
        }
        
    })
    .catch((err) => {
        console.error(err);
        if(err.name === 'CastError') {
            res.status(404).json({
                "msg": `Bad Request, ${id} is not a valid id`
            })
        }
        else{
            res.status(500).json(err)
        }       

    });
    
};


const readOne = (req, res) => {

    let id = req.params.id;

    // connect to db and retrieve User with :id
    User.findById(id).populate('vehicles').populate('likes')
    .then((data) => {
        if(data){
            let img = `${process.env.STATIC_FILES_URL}${data.image_path}`;
            data.image_path = img;
            res.status(200).json(data);
        }
        else{
            res.status(404).json({
                "msg": `User with id: ${id} not found`
            });
        }
        
    })
    .catch((err) => {
        console.error(err);
        if(err.name === 'CastError') {
            res.status(404).json({
                "msg": `Bad Request, ${id} is not a valid id`
            })
        }
        else{
            res.status(500).json(err)
        }       

    });
    
};
//register user
const register = (req, res) => {
    let newUser = new User(req.body);
    newUser.password = bcrypt.hashSync(req.body.password, 10);

    console.log(newUser);

    newUser.save((err, user) => {
        if(err){
            return res.status(400).json({
                msg: err
            });
        }
        else{
            user.password = undefined;
            return res.status(201).json(user);
        }
    });
};
//login user
const login = (req, res) => {
    User.findOne({
        email: req.body.email
    })
    .then((user) => {
        if(!user || !user.comparePassword(req.body.password)){
            res.status(401).json({
                msg: 'Authentication failed. Invalid user or password'
            });
        }
        else{
            // generate a token
            let token = jwt.sign({
                email: user.email,
                fName: user.fName,
                _id: user._id
                //role: admin
            },process.env.APP_KEY) //added salt 
            
            res.status(200).json({
                msg: 'All good',
                token: token,
                id: user._id,
                email: user.email,
                fName: user.fName
            })
        }
    })
    .catch((err) => {
        throw err;
    })
};


const updateData = (req, res) => {

    let id = req.params.id;
    let body = req.body;
    let file = req.file;

    if(process.env.STORAGE_ENGINE === 'S3'){
        file = req.file.key;
    }
    else{
        file = req.file.filename;
    }

    if(file){
        body.image_path = file;
    }
    else {
        return res.status(422).json({
            message: req.imageError || "image not uploaded"
        })
    }

    User.findByIdAndUpdate(id, body, {
        new: true
    })
        .then((data) => {
            if(data){
                 //old image delete//
                ///////////////////
                deleteImage(data.image_path)
                ///////////////////


                data.password = bcrypt.hashSync(data.password, 10);



                res.status(201).json(data);
            }
            else{
                res.status(404).json({
                    "msg": `User with id: ${id} not found`
                })
            }
            // res.status(200).json({
            //     "msg": "Sucess",
            //     "data": data
            // })
        })
        .catch((err) => {
            if(err.name === 'ValidationError'){
                console.error('Validation Error!!', err);
                res.status(422).json({
                    "msg": "Validation Error",
                    "err": err.message
                })
            }
            else if(err.name === 'CastError') {
                res.status(404).json({
                    "msg": `Bad Request, ${id} is not a valid id`
                })
            }            
            else{
            console.error(err);
            res.status(500).json(err);
            }
        });   
    
};
const deleteData = (req, res) => {

    let id = req.params.id;
    let imagePath = '';

    User.findById(id)
       .then((data) => {
            if(data){
                imagePath = data.image_path;
                return data.remove();
            }
            else{
                res.status(400).json({
                    "message": `Bad request, ${id} is not a valid id`
                });
            }
       })
       //changed promise
       .then((data) => {
            console.log('User removed');
            //////Delete Image/////////
            deleteImage(imagePath);
            ///////////////////////////
            res.status(200).json({
                "message": `User with id: ${id} deleted sucussfully`
            })
       })
    .catch((err) => {
        console.error(err);
        if(err.name === 'CastError') {
            res.status(404).json({
                "msg": `Bad Request, ${id} is not a valid id`
            })
        }
        else{
            res.status(500).json(err)
        }       

    })
};
module.exports = {
    register,
    login,
    readData,
    readOne,
    readAuth,
    updateData,
    deleteData
   
};