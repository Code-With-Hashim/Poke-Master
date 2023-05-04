const mongoose = require("mongoose");

const pokeBallSchema = new mongoose.Schema({
  name : {type : String , required : true},
  defaultName : {type : String , required : true},
  stock : {type : Number , required : true},
})

const megaStoneSchema = new mongoose.Schema({
  name: { type: String, },
  description: { type: String, },
  price: { type: Number},
});

const tmSchema = new mongoose.Schema({
  name: { type: String},
  description: { type: String },
  price: { type: Number },
  move: { type: String },
});

const inventorySchema = new mongoose.Schema({
  owner: {
    type: Number,
    unique : true
  },
  pokeDollars: {type : Number , required : true , default : 50},
  pokeBalls: [pokeBallSchema],
  megaStones: [megaStoneSchema],
  TMs: [tmSchema],
  megaRingisEquipped:{type : Boolean , default : false}
});


const userInvModal = mongoose.model("userInv", inventorySchema);

module.exports = { userInvModal };
