const LikeVehicle = require('../controllers/models/like_vehicle_schema');

const createLike = (req, res) => {
    

    console.log(req);
    let likeVehicleData = req.body;
////////////////////likeVehicle.findOne/////////////
    LikeVehicle.find(likeVehicleData)
        .then((data) => {
            if(data.length == 0){
                LikeVehicle.create(likeVehicleData)
                    .then((data) => {
                        console.log('New Vehicle like created',data);
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
            }
            else{
                LikeVehicle.deleteOne(likeVehicleData)
                .then((data) => {
                    
                    res.status(201).json(data);
                })
            }
        })
    
    // connect to db, check if email exists, if yes respond with error
    // if some Vehicle info is missing, respond with error
    
   
};

const readLike = (req, res) => {
    let id = req.user._id;
    
    LikeVehicle.find({ user_id: id }).populate('vehicle_id')
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


const getUsersThatLiked = (req, res) => {
    let id = req.params.id;
    
    LikeVehicle.find({ vehicle_id: id }).populate('user_id')
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


module.exports = {
    readLike,
    createLike,
    getUsersThatLiked
};
