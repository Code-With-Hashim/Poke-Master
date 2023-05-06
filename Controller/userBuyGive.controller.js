const { PokeMartModel } = require("../model/pokeStore.model");
const { userInvModal } = require("../model/userInventory");

async function userBuyCommand(bot, msg, match) {
  const userId = msg.from.id;
    const product = match[1];


  try {
   
    const pokeStoreList = await PokeMartModel.find();
    const userPokeDetail = await userInvModal.findOne({ owner: userId });

    pokeStoreList.forEach((el) => {
      
      el.pokeBalls.forEach((item) => {
        const itemName = item.name.split(" ")[0].toLowerCase();
          if (itemName === product) {
        buyPokeBalls({bot , useritem , product ,msg , match })
    }
      
    })
    })
    
  } catch(err) {
    console.log(err)
  }
}

         

async function buyPokeBalls({bot , useritem , product ,msg , match }) {
  
  try {
    
  }
  catch(err) {
    console.log(err)
  }
  
}