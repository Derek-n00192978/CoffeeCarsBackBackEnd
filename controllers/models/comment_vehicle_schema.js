const { Schema, model } = require('mongoose');
const bcrypt = require('bcryptjs'); 
const commentVehicleSchema = Schema(
    {
        comment:{
            type:String,
        },
        vehicle_id:{
            type: Schema.Types.ObjectId,
            ref: 'Vehicle',
            required: [true, 'vehicle_id field is required'],
        },
        user_id:{
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'user_id is followee field is required']    
    },
}
);


;
module.exports = model('Comment_Vehicle', commentVehicleSchema);