const Vehicle = require('../controllers/models/vehicle_schema');

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
    Vehicle.find().populate('user')
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
    //     "msg" : "All Vehicle retrieved"
    // });
};

const readOne = (req, res) => {

    let id = req.params.id;

    // connect to db and retrieve Vehicle with :id
    Vehicle.findById(id).populate('user')
    .then((data) => {
        if(data){
            let img = `${process.env.STATIC_FILES_URL}${data.image_path}`;
            data.image_path = img;
            res.status(200).json(data);
        }
        else{
            res.status(404).json({
                "msg": `Vehicle with id: ${id} not found`
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

const createData = (req, res) => {
    console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");

    console.log(req);
    let vehicleData = req.body;
    let file = req.file;

    if(process.env.STORAGE_ENGINE === 'S3'){
        file = req.file.key;
    }
    else{
        file = req.file.filename;
    }

    

    if(file){
        vehicleData.image_path = file;
    }
    else {
        return res.status(422).json({
            message: req.imageError || "image not uploaded"
        })
    }
    // connect to db, check if email exists, if yes respond with error
    // if some Vehicle info is missing, respond with error
    Vehicle.create(vehicleData)
            .then((data) => {
                console.log('New Vehicle created',data);
                res.status(201).json(data);
            })
            .catch((err) => {
                if(err.name === 'ValidationError'){
                    console.error('Validation Error!!', err);
                    res.status(422).json({
                        "msg": "Validation Error",
                        "err": err.message
                    })
                }
                else{
                console.error(err);
                res.status(500).json(err);
                }
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

    Vehicle.findByIdAndUpdate(id, body, {
        new: true
    })
        .then((data) => {
            if(data){
                 //old image delete//
                ///////////////////
                deleteImage(data.image_path)
                ////////////////////
                res.status(201).json(data);
            }
            else{
                res.status(404).json({
                    "msg": `Vehicle with id: ${id} not found`
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

    Vehicle.findById(id)
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
            console.log('Vehicle removed');
            //////Delete Image/////////
            deleteImage(imagePath);
            ///////////////////////////
            res.status(200).json({
                "message": `Vehicle with id: ${id} deleted sucussfully`
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
    readData,
    readOne,
    createData,
    updateData,
    deleteData
};
