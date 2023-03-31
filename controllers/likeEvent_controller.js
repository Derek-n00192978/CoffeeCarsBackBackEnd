const LikeEvent = require('../controllers/models/like_event_schema');


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
    //     "msg" : "All Vehicle retrieved"
    // });
};



module.exports = {
    readLike
};
