const users = {}
const battleActiveUsers = {}
const isMoving = {}
const escape = {}


function isTrainerMove(userId , id) {
    
    if(id) {
        isMoving[userId] = {timeoutId : id}
    }
    return isMoving[userId].timeoutId
}




function setPreviousMessageId(userId , message_id) {
    users[userId] = {prevMessageId : message_id} 
}

function getPreviousMessageId(userId , hunt_id) {

    if(users[userId]?.prevMessageId === hunt_id) {
        return true
   }
   return false
}

function startBattle (userId) {
    battleActiveUsers[userId] = {battleActive : true}
    
}

function endBattle (userId) {
    battleActiveUsers[userId] = {battleActive : false}
}

function isBattleActive(userId) {
    
    
    if(battleActiveUsers[userId]?.battleActive) {
        return true
    }
    return false
}


function gameEscap(userId , val) {
    escape[userId] = {isEscape : val}
    
    if(val) {
        if(escape[userId].isEscape) {
        return true
     } else {
        return false
     }
    }
    
    
}


module.exports = {gameEscap ,startBattle , endBattle , isBattleActive , setPreviousMessageId , getPreviousMessageId , isTrainerMove }