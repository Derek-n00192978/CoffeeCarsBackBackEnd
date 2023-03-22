const { Schema, model } = require('mongoose');
const bcrypt = require('bcryptjs'); 
const user_vehicleSchema = Schema(
    {
        user_id:{
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'fName field is required'],
        },
        vehicle_id:{
            type: Schema.Types.ObjectId,
            ref: 'Vehicle',
            required: [true, 'password field is required']
        }
    },
    { timestamps: true }
);
//password checker
// userSchema.methods.comparePassword = function(password){
//     return bcrypt.compareSync(password, this.password, function(result){
//         return result;
//     });
// };
module.exports = model('User_vehicle', user_vehicleSchema);