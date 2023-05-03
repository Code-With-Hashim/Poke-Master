const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  _id: { type: Number },
  userDetail: {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    username: { type: String, required: true },
  },
} , {
    versionKey : false,
    timestamps : true
});

const userModel = mongoose.model("user", userSchema);

module.exports = { userModel };
