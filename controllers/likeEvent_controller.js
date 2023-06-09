const LikeEvent = require('../controllers/models/like_event_schema');

const createLike = (req, res) => {
    

    console.log(req);
    let likeEventData = req.body;

    
    // connect to db, check if email exists, if yes respond with error
    // if some Vehicle info is missing, respond with error
    LikeEvent.create(likeEventData)
        .then((data) => {
            console.log('New Event like created',data);
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

const readLike = (req, res) => {
    LikeEvent.find().populate()
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
    //     "msg" : "All Events retrieved"
    // });
};



module.exports = {
    readLike,
    createLike
};