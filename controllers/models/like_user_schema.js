const { Schema, model } = require('mongoose');
const bcrypt = require('bcryptjs'); 
const likeUserSchema = Schema(
    {
        user_id:{
            type: Object,
            required: [true, 'user_id is follower field is required'],
        },
        user_id:{
            type:Object,
            required: [true, 'user_id is followee field is required']    
    },
}
);
;
module.exports = model('Like_User', likeUserSchema);