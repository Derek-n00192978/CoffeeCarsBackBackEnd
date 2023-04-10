const { Schema, model } = require('mongoose');
const bcrypt = require('bcryptjs'); 
const likeEventSchema = Schema(
    {
        event_id:{
            type: Object,
            required: [true, 'event_id field is required'],
        },
        user_id:{
            type:Object,
            required: [true, 'user_id is followee field is required']    
        },
    },
    { timestamps: true }
);
;
module.exports = model('Like_Event', likeEventSchema);