const mongoose = require("mongoose");

const connect = mongoose.connect(process.env.MONGO_DB_URL , {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000, // Optional: Timeout for server selection
    socketTimeoutMS: 60000, // 60 seconds - Adjust as per your needs
});



module.exports = { connect };
