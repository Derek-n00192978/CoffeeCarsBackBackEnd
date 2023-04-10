const { Schema, model } = require('mongoose');

const comentEventSchema = Schema(
    {
        text:{
            type: String,
        },
        user_id:{
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'user_id is followee field is required']
        },
        event_id:{
            type: Schema.Types.ObjectId,
            ref: 'Event',
            required: [true, 'event_id field is required'],
        },      

    },
    { timestamps: true }
);

module.exports = model('commentEvent', commentEventSchema);