const mongoose = require('mongoose');

const connect = async () => {
    let db = null;
    try{
        await mongoose.connect(process.env.DB_ATLAS_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("Connected sucessfully to db");
        db = mongoose.connection;
    }
    catch(error){
        console.log(error);

    }
    finally {
        if (db !== null && db.readyState === 1) {
           // await db.close();
           // console.log("Disconnected successfully from db")

        }
    }
};

module.exports = connect;