const { Schema, model } = require('mongoose');
const bcrypt = require('bcryptjs'); 
const userSchema = Schema(
    {
        fName:{
            type: String,
            required: [true, 'fName field is required'],
        },
        password:{
            type:String,
            required: [true, 'password field is required']
        },
        email:{
            type: String,
            required: [true, 'email field is required'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        county:{
            type:String,
        },
        bio:{
            type:String,
        },
        type:{
            type:String,
        },
        typeExtra:{
            type:String,
        },
        admin:{
            type: Boolean
        },
        profile_img:{
            type: String
        },
        vehicles:{
            type: [Schema.Types.ObjectId],
            ref: 'Vehicle'
        }
    },
    {
        toJSON: { virtuals: true }
    },
    { timestamps: true }
);

userSchema.virtual('likes', {
    ref: 'Like_Vehicle',
    localField: '_id',
    foreignField: 'user_id'
  });
//password checker
userSchema.methods.comparePassword = function(password){
    return bcrypt.compareSync(password, this.password, function(result){
        return result;
    });
};
module.exports = model('User', userSchema);