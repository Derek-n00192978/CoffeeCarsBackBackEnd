const { Schema, model } = require('mongoose');
const bcrypt = require('bcryptjs'); 
const likeVehicleSchema = Schema(
    {
        vehicle_id:{
            type: Object,
            required: [true, 'vehicle_id field is required'],
        },
        user_id:{
            type:Object,
            required: [true, 'user_id is followee field is required']    
    },
}
);
;
module.exports = model('Like_Vehicle', likeVehicleSchema);