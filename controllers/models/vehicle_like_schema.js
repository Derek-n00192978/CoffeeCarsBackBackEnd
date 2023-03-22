const { Schema, model } = require('mongoose');

const vehicle_likeSchema = Schema(
    {
        user_id:{
            type: String,
        },
        vehicle_id:{
            type: String,
        },      

    },
    { timestamps: true }
);

module.exports = model('Vehicle_like', vehicle_likeSchema);