const { Schema, model } = require('mongoose');

const event_comentSchema = Schema(
    {
        text:{
            type: String,
        },
        date:{
            type: Date,
        },
        user_id:{
            type: String,
        },
        event_id:{
            type: String,
        },      

    },
    { timestamps: true }
);

module.exports = model('Comment', event_commentSchema);