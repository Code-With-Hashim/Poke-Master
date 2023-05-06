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
          buyPokeBalls({
            bot,
            msg,
            match,
            itemName,
            item,
            userPokeDetail,
          });
        }
      });
    });
  } catch (err) {
    console.log(err);
  }
}

async function buyPokeBalls({
  bot,
  msg,
  match,
  item,
  itemName,
  userPokeDetail,
}) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const product = match[1];
  const quantity = match[2];
  let check = false;

  try {
    const totalPrice = item.price * quantity;

    if (userPokeDetail.pokeDollars >= totalPrice) {
      const remainingPokeDollars = userPokeDetail.pokeDollars - totalPrice;
      const totalPoke = (userItem.stock += Number(quantity));
      userPokeDetail.pokeBalls.length !== 0 &&
        userPokeDetail.pokeBalls.forEach((userItem) => {
          const myPokeBallName = userItem.name.trim().split(" ")[0];
          if (myPokeBallName === itemName) {
            check = true;
            userInvModal
              .updateOne(
                {
                  owner: userId,
                  "pokeBalls.name": item.name.toLowerCase(),
                },
                {
                  $set: {
                    "pokeBalls.$.stock": totalPoke,
                    pokeDollars: remainingPokeDollars,
                  },
                }
              )
              .then(async (res) => {
                if (res.modifiedCount !== 0) {
                  await bot.sendMessage(
                    chatId,
                    `You purchased ${quantity} ${item.name}

Total spent: ${totalPrice} 💵`,
                    {
                      reply_to_message_id: msg.message_id,
                    }
                  );
                }
              })
              .catch((err) => console.log(err));
          }
        });

      if (!check) {
        const newItem = {
          name: item.name.toLowerCase(),
          stock: +quantity,
        };

        userInvModal
          .updateOne({ owner: userId }, { $push: { pokeBalls: newItem } })
          .then(async (res) => {
            if (res.modifiedCount !== 0) {
              await bot.sendMessage(
                chatId,
                `You purchased ${quantity} ${item.name}

Total spent: ${totalPrice} 💵`,
                {
                  reply_to_message_id: msg.message_id,
                }
              );
            }
          })
          .catch((err) => console.log(err));
      }
    } else {
      bot.sendMessage(
        chatId,
        `Not enough Poke Dollars
Battle to win more`,
        {
          reply_to_message_id: msg.message_id,
        }
      );
    }
  } catch (err) {
    console.log(err);
  }
}

module.exports = { userBuyCommand };
