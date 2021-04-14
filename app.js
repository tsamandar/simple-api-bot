const { Telegraf, Markup } = require("telegraf");
const fs = require("fs");
const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);

const helpMsg = `
*Simple API BOT*
/fortune - get a fortune cookie
/cat - get a random cat pic 
/cat \`<text>\` - get cat image with text
/dogbreeds - get list of dog breeds
/dog \`<breed>\` - get image of dog breed
`;

bot.command(["start", "help"], (ctx) =>
  ctx.reply(helpMsg, { parse_mode: 'Markdown' })
);

bot.command("fortune", (ctx) => {
  axios
    .get("http://yerkee.com/api/fortune")
    .then((res) => ctx.reply(res.data.fortune))
    .catch((err) => console.log(err));
});

bot.command("cat", async (ctx) => {
  let input = ctx.message.text;
  let inputArray = input.split(" ");

  if (inputArray.length == 1) {
    try {
      await axios
        .get("https://aws.random.cat/meow")
        .then((res) => ctx.replyWithPhoto(res.data.file));
    } catch (e) {
      console.log(e);
    }
  } else {
    inputArray.shift();
    let text = inputArray.join(" ");
    ctx.replyWithPhoto(`https://cataas.com/cat/says/${text}`);
  }
});

bot.command("dogbreeds", (ctx) => {
  let rawdata = fs.readFileSync("./dogbreeds.json", "utf8");
  let data = JSON.parse(rawdata);

  let msg = "Dog Breeds:\n";
  data.forEach((item, index) => (msg += `${++index}.  ${item}\n`));
  ctx.reply(msg);
});

bot.command("dog", (ctx) => {
  let input = ctx.message.text;
  let inputArray = input.split(" ");

  if (inputArray.length != 2)
    return ctx.reply("You must give a dog breed as the second argument!");

  let breedInput = inputArray[1];

  let rawdata = fs.readFileSync("./dogbreeds.json", "utf8");
  let data = JSON.parse(rawdata);

  if (data.includes(breedInput)) {
    axios
      .get(`https://dog.ceo/api/breed/${breedInput}/images/random`)
      .then((res) => ctx.replyWithPhoto(res.data.message))
      .catch((e) => console.log(e));
  } else {
    let suggestions = data.filter((item) => item.startsWith(breedInput));

    if (suggestions.length == 0) return ctx.reply("Not found");

    let msg = `Did you mean:\n`;
    suggestions.forEach((item) => (msg += `* ${item}\n`));

    ctx.reply(msg);
  }
});

bot.launch();
