const Event = require('../controllers/models/event_schema');
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
            console;e.log("Error", err)
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
    Event.find()
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
    //     "msg" : "All Event retrieved"
    // });
};

const readOne = (req, res) => {

    let id = req.params.id;

    // connect to db and retrieve Event with :id
    Event.findById(id)
    .then((data) => {
        if(data){
            let img = `${process.env.STATIC_FILES_URL}${data.image_path}`;
            data.image_path = img;
            res.status(200).json(data);
        }
        else{
            res.status(404).json({
                "msg": `Event with id: ${id} not found`
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
    //console.log(req.body);
    let eventData = req.body;
    let file = req.file;

    if(process.env.STORAGE_ENGINE === 'S3'){
        file = req.file.key;
    }
    else{
        file = req.file.filename;
    }

    if(req.file){
        eventData.image_path = file;
    }
    else {
        return res.status(422).json({
            message: req.imageError || "image not uploaded"
        })
    }
    // connect to db, check if email exists, if yes respond with error
    // if some Event info is missing, respond with error
    Event.create(eventData)
            .then((data) => {
                console.log('New Event created',data);
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
        body.image_path = file.filename;
    }
    else {
        return res.status(422).json({
            message: req.imageError || "image not uploaded"
        })
    }

    Event.findByIdAndUpdate(id, body, {
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
                    "msg": `Event with id: ${id} not found`
                })
            }
            res.status(200).json({
                "msg": "Sucess",
                "data": data
            })
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

    Event.findById(id)
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
            console.log('Event removed');
            //////Delete Image/////////
            deleteImage(imagePath);
            ///////////////////////////
            res.status(200).json({
                "message": `Event with id: ${id} deleted sucussfully`
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
