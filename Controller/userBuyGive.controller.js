const { PokeMartModel } = require("../model/pokeStore.model");
const { userInvModal } = require("../model/userInventory");

async function userBuyCommand(bot, msg, match) {
  const userId = msg.from.id;
  const chatId = msg.chat.id;
  const product = match.input.trim().split(" ")[1];
  const pokeName = match.input.trim().split(" ")[2];
  let itemNotExist = false;

  try {
    const pokeStoreList = await PokeMartModel.find();
    const userPokeDetail = await userInvModal.findOne({ owner: userId });

    pokeStoreList.forEach((el) => {
      if (product === "ring") {
        buyMegaRing({ bot, msg, userPokeDetail, megaRing: el.megaRing });
        itemNotExist = true;
      }

      el.pokeBalls.forEach((item) => {
        const itemName = item.name.split(" ")[0].toLowerCase();
        if (itemName === product) {
          const userUpdateInv = "pokeBalls";
          buyPokeItems({
            bot,
            msg,
            match,
            itemName,
            item,
            userPokeDetail,
            userUpdateInv,
          });
          itemNotExist = true;
        }
      });
      el.items.forEach((item) => {
        const itemName = item.name.split(" ")[0].toLowerCase();
        const userUpdateInv = "pokeItems";
        if (itemName === product) {
          buyPokeItems({
            bot,
            msg,
            match,
            itemName,
            item,
            userUpdateInv,
            userPokeDetail,
          });
          itemNotExist = true;
        }
      });

      el.megaStone.forEach((item) => {
        const productName = item.pokemon[0].trim().toLowerCase();
        const megaStonePrice = item.price;

        if (productName === pokeName) {
          buyMegaStone({
            bot,
            msg,
            match,
            userPokeDetail,
            item,
            megaStonePrice,
          });
          itemNotExist = true;
          // console.log(productName , pokeName)
        }
      });
    });

    if (!itemNotExist) {
      bot.sendMessage(
        chatId,
        `Format: /buy <item> <amount> \n\n\n if You're buy mega stone: \n\n  Format: /buy <item> <poke name>`,
        {
          reply_to_message_id: msg.message_id,
        }
      );
    }
  } catch (err) {
    console.log(err);
  }
}

async function buyPokeItems({
  bot,
  msg,
  match,
  itemName,
  item,
  userPokeDetail,
  userUpdateInv,
}) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const quantity = match.input.trim().split(" ")[2];
  let check = false;

  try {
    const totalPrice = item.price * quantity;

    if (userPokeDetail.pokeDollars >= totalPrice) {
      const remainingPokeDollars = userPokeDetail.pokeDollars - totalPrice;

      userPokeDetail[userUpdateInv].length !== 0 &&
        userPokeDetail[userUpdateInv].forEach((userItem) => {
          // work on that
          const myPokeItem = userItem.name.trim().split(" ")[0];
          if (myPokeItem === itemName) {
            const totalPoke = (userItem.stock += Number(quantity));
            check = true;
            const userUpdateStock = `${userUpdateInv}.$.stock`;
            const userUpdateName = `${userUpdateInv}.name`;
            console.log(userUpdateName);
            console.log(item.name);
            userInvModal
              .updateOne(
                {
                  owner: userId,
                  [userUpdateName]: item.name.toLowerCase(), // work on that
                },
                {
                  $set: {
                    [userUpdateStock]: totalPoke, // work on that
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
          .updateOne(
            { owner: userId },
            {
              $push: { [userUpdateInv]: newItem }, // work on that
              $set: { pokeDollars: remainingPokeDollars },
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

async function buyMegaStone({
  bot,
  msg,
  match,
  userPokeDetail,
  item,
  megaStonePrice,
}) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const pokeName = match.input.trim().split(" ")[2];
  let check = false;

  try {
    userPokeDetail.megaStones.length !== 0 &&
      userPokeDetail.megaStones.filter((userItem) => {
        if (userItem.pokemon === pokeName) {
          check = true;
          return bot.sendMessage(
            chatId,
            "You've already a megastone of this pokemon",
            {
              reply_to_message_id: msg.message_id,
            }
          );
        }
      });

    if (!check) {
      const newItem = {
        name: item.name,
        pokemon: pokeName,
      };

      if (userPokeDetail.pokeDollars >= megaStonePrice) {
        const remainingPokeDollars =
          userPokeDetail.pokeDollars - megaStonePrice;

        userInvModal
          .updateOne(
            { owner: userId },
            {
              $push: { megaStones: newItem },
              $set: { pokeDollars: remainingPokeDollars },
            }
          )
          .then(async (res) => {
            if (res.modifiedCount !== 0) {
              await bot.sendMessage(
                chatId,
                `You purchased <b>${pokeName}</b> mega stone

Total spent: ${megaStonePrice} 💵`,
                {
                  reply_to_message_id: msg.message_id,
                  parse_mode: "HTML",
                }
              );
            }
          })
          .catch((err) => console.log(err));
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
    }
  } catch (err) {
    console.log(err);
  }
}

async function buyMegaRing({ bot, msg, userPokeDetail, megaRing }) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  try {
    if (userPokeDetail.pokeDollars >= megaRing.price) {
      const remainingPokeDollars = userPokeDetail.pokeDollars - megaRing.price;
      if (userPokeDetail.megaRingisEquipped) {
        bot.sendMessage(chatId, "You've already a mega ring", {
          reply_to_message_id: msg.message_id,
        });
      } else {
        userInvModal
          .findOneAndUpdate(
            { owner: userId },
            { pokeDollars: remainingPokeDollars, megaRingisEquipped: true },
            {}
          )
          .then(() =>
            bot.sendMessage(
              chatId,
              `You purchased <b>Mega Ring</b>

Total spent: ${megaRing.price} 💵`,
              {
                reply_to_message_id: msg.message_id,
                parse_mode: "HTML",
              }
            )
          )
          .catch((err) => console.log("err", err));
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

async function userGivePokeDollar(bot, msg, match) {
  const chatId = msg.chat.id;
  const giveUserId = msg.from.id;
  const receiveUserId = msg.reply_to_message && msg.reply_to_message.from.id;
  const sendAmt = match.input.trim().split(" ").map(Number)[1];
  let isSent = false

  try {

    const giveuserDetail = await userInvModal.findOne({ owner: giveUserId });
    if (giveuserDetail.pokeDollars >= sendAmt && receiveUserId) {
              isSent = true
      userInvModal
        .findOneAndUpdate(
          { owner: receiveUserId },
          { $inc: { pokeDollars: sendAmt } },
          { new: true }
        )
        .then(() => {
          userInvModal
            .findOneAndUpdate(
              { owner: giveUserId },
              { $inc: { pokeDollars: -sendAmt } },
              { new: true }
            )
            .then(() => {
              bot.sendMessage(chatId, `Poke Dollar sent`, {
                reply_to_message_id: msg.message_id,
              });
              
            });
        })
        .catch((err) => console.log(err));
    }
    
    if(!isSent || typeof sendAmt !== "number" ) {
      bot.sendMessage(chatId , `Format: /give <amount> ` , {
          reply_to_message_id: msg.message_id,
      })
    }
    
  } catch (err) {
    console.log(err);
  }
}

module.exports = { userBuyCommand, userGivePokeDollar };
