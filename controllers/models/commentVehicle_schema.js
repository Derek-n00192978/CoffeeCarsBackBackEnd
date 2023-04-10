const { Schema, model } = require('mongoose');

const comentVehicleSchema = Schema(
    {
        text:{
            type: String,
        },
        user_id:{
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'user_id is followee field is required']
        },
        vehicle_id:{
            type: Schema.Types.ObjectId,
            ref: 'Vehicle',
            required: [true, 'vehicle_id field is required'],
        },      

    },
    { timestamps: true }
);

module.exports = model('commentVehicle', commentVehicleSchema);