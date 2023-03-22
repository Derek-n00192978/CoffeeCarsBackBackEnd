const { Schema, model } = require('mongoose');

const followerSchema = Schema(
    {
        follower_id:{
            type: String,
        },
        followee_id:{
            type: String,
        },     

    },
    { timestamps: true }
);

module.exports = model('Follower', followerSchema);