const { Schema, model } = require('mongoose');

const eventSchema = Schema(
    {
        date:{
            type: Date,
            required: [true, 'date field is required'],
        },
        title:{
            type: String,
            required: [true, 'date field is required'],
        },
        description:{
            type: String,
        },
        lat_long:{
            type: String,
        },
        image_path:{
            type: String,
        },       

    },
    { timestamps: true }
);

module.exports = model('Event', eventSchema);