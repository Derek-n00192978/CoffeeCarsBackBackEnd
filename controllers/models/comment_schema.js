const { Schema, model } = require('mongoose');

const comentSchema = Schema(
    {
        date:{
            type: Date,
            required: [true, 'date field is required'],
        },
        text_id:{
            type: String,
        },
        user_id:{
            type: String,
        },
        vehicle_id:{
            type: String,
        },      

    },
    { timestamps: true }
);

module.exports = model('Comment', commentSchema);