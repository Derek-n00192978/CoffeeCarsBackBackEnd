const { Schema, model } = require('mongoose');

const event_coment_likeSchema = Schema(
    {
        user_id:{
            type: String,
        },
        comment_id:{
            type: String,
        },      

    },
    { timestamps: true }
);

module.exports = model('Event_comment_like', event_comment_likeSchema);