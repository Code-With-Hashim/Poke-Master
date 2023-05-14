const { getOpponentPokemon } = require("./battle.controller")

const users = {}

function startBattle (userId) {
    users[userId] = {battleActive : true}
}

function endBattle (userId) {
    users[userId] = {battleActive : false}
}

function canHunt(userId) {
    if(users[userId]?.battleActive) {
        return false
    }
    return true
}


module.exports = {startBattle , endBattle , canHunt}