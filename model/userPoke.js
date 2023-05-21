const mongoose = require("mongoose");

const MoveSchema = new mongoose.Schema({
  name: { type: String, required: true },
  power: { type: Number, required: true },
  accuracy: { type: Number, required: true },
  type : {type : String , required : true},
  category : {type : String , required : true},
});

const userPokeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image : {type : String , required : true},
  isShiny : {type : String , default : false},
  nickname : String,
  type: { type: [String], required: true },
  level: { type: Number, required: true },
  abilities: [{ name: String, effect: String }],
  moves: {
    type: [MoveSchema],
    validate: {
      validator: function (moves) {
        return moves.length <= 4; // Maximum of 4 moves allowed
      },
      message: "A Pokemon cannot have more than 4 moves",
    },
  },
  baseStats: {
    hp: { type: Number, required: true },
    attack: { type: Number, required: true },
    defense: { type: Number, required: true },
    specialAttack: { type: Number, required: true },
    specialDefense: { type: Number, required: true },
    speed: { type: Number, required: true },
  },
  nature: {
    name: { type: String, required: true },
    stats: {
      attack: { type: Number, default: 1 },
      defense: { type: Number, default: 1 },
      specialAttack: { type: Number, default: 1 },
      specialDefense: { type: Number, default: 1 },
      speed: { type: Number, default: 1 },
    },
  },
  iv: {
    hp: { type: Number, required: true },
    attack: { type: Number, required: true },
    defense: { type: Number, required: true },
    specialAttack: { type: Number, required: true },
    specialDefense: { type: Number, required: true },
    speed: { type: Number, required: true },
  },
  ev: {
    hp: { type: Number, default: 0 },
    attack: { type: Number, default: 0 },
    defense: { type: Number, default: 0 },
    specialAttack: { type: Number, default: 0 },
    specialDefense: { type: Number, default: 0 },
    speed: { type: Number, default: 0 },
  },
  isReadytoEvolve : {
    evolve_level : {type : Number, required : true},
    evolve_to : {type : String , required : true},
    ready : {type : Boolean , default : false}
  },
  group : {type : Number},
  experience: { type: Number, required: true },
  trainer: { type: Number, required: true },
});

const userPokeModal = mongoose.model("userPoke", userPokeSchema);

module.exports = { userPokeModal };
