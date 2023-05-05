const mongoose = require("mongoose");

const pokeBallSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

const megaStoneSchema = new mongoose.Schema({
  name: { type: String, required: true },
  pokemon: [{ type: String, required: true }],
  price: { type: Number, required: true },
});

const pokeMartSchema = new mongoose.Schema({
  pokeBalls: [pokeBallSchema],
  items: [itemSchema],
  megaRing: {
    name: { type: String, required: true },
    price: { type: Number, required: true },
  },
  megaStone: [megaStoneSchema],
});

const PokeMartModel = mongoose.model("PokeMart", pokeMartSchema);

module.exports = { PokeMartModel };
