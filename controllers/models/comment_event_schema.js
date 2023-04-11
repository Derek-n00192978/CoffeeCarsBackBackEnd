const { Schema, model } = require('mongoose');
const bcrypt = require('bcryptjs'); 
const commentEventSchema = Schema(
    {
        comment:{
            type:String,
        },
        event_id:{
            type: Schema.Types.ObjectId,
            ref: 'Event',
            required: [true, 'event_id field is required'],
        },
        user_id:{
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'user_id is followee field is required'],    
        },
    },
    { timestamps: true }
);
;
module.exports = model('Comment_Event', commentEventSchema);