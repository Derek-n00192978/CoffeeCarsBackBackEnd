const { Schema, model } = require('mongoose');

const coment_likeSchema = Schema(
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

module.exports = model('Comment', comment_likeSchema);