const { Schema, model } = require('mongoose');

const typeSchema = Schema(
    {
        name:{
            type: String,
            required: [true, 'date field is required'],
        },
              

    },
    { timestamps: true }
);

module.exports = model('Type', typeSchema);