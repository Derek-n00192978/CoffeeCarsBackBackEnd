const { Schema, model } = require('mongoose');

const vehicleSchema = Schema(
    {
        make:{
            type: String,
            required: [true, 'make field is required'],
        },
        model:{
            type: String,
            required: [true, 'model field is required'],
        },
        year:{
            type: String,
            required: [true, 'year field is required'],
        },
        fuel:{
            type: String,
            required: [true, 'fuel field is required'],
        },
        description:{
            type: String,
        },
        forSale:{
            type: Boolean,
        },
        image_path:{
            type:String,
        },
        type_id:{
            type:String,
        },
        user:{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }

    },
    {
        toJSON: { virtuals: true }
    },
    { timestamps: true }
);

vehicleSchema.virtual('likes', {
    ref: 'Like_Vehicle',
    localField: '_id',
    foreignField: 'vehicle_id'
  });

module.exports = model('Vehicle', vehicleSchema);