require("dotenv").config();
const {
  Bot,
  GrammyError,
  HttpError,
  Keyboard,
  InlineKeyboard,
} = require("grammy");

const { getRandomQuestion, getCorrectAnswer } = require("./utils");

const bot = new Bot(process.env.BOT_API_KEY);

bot.command("start", async (ctx) => {
  const startKeyboard = new Keyboard()
    .text("HTML")
    .text("CSS")
    .row()
    .text("JavaScript")
    .text("React")
    .row()
    .text("Случайный вопрос")
    .resized();
  await ctx.reply(
    "Привет! Я - Frontend Interview Prep Bot 🦄. \nЯ помогу тебе подготовиться к интервью по фронтенд-разработке"
  );
  await ctx.reply("С чего начнем ? Выбери тему вопроса в меню ниже", {
    reply_markup: startKeyboard,
  });
});

bot.hears(
  ["HTML", "CSS", "JavaScript", "React", "Случайный вопрос"],
  async (ctx) => {
    const topic = ctx.message.text;
    const { question, questionTopic } = getRandomQuestion(topic);

    console.log(question);
    //   const inlineKeyboard = new InlineKeyboard().text(
    //     "Узнать ответ",
    //     JSON.stringify({
    //       type: ctx.message.text,
    //       questionId: question.id,
    //     })
    //   );

    let inlineKeyboard;

    if (question.hasOptions) {
      const buttonRows = question.options.map((option) => [
        InlineKeyboard.text(
          option.text,
          JSON.stringify({
            type: `${questionTopic}-option`,
            isCorrect: option.isCorrect,
            questionId: question.id,
          })
        ),
      ]);

      inlineKeyboard = InlineKeyboard.from(buttonRows);
    } else {
      inlineKeyboard = new InlineKeyboard().text(
        "Узнать ответ",
        JSON.stringify({
          type: questionTopic,
          questionId: question.id,
        })
      );
    }

    await ctx.reply(question.text, {
      reply_markup: inlineKeyboard,
    });
  }
);

bot.on("callback_query:data", async (ctx) => {
  const callBackData = JSON.parse(ctx.callbackQuery.data);

  if (!callBackData.type.includes("option")) {
    const answer = getCorrectAnswer(callBackData.type, callBackData.questionId);

    await ctx.reply(answer, {
      parse_mode: "HTML",
      disable_web_page_preview: true,
    });
    await ctx.answerCallbackQuery();

    return;
  }

  if (callBackData.isCorrect) {
    await ctx.reply("Верно !");
    await ctx.answerCallbackQuery();
    return;
  }

  const answer = getCorrectAnswer(
    callBackData.type.split("-")[0],
    callBackData.questionId
  );
  await ctx.reply(`Неверно ! Правильный ответ: ${answer}`);
  await ctx.answerCallbackQuery();
});

bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}`);

  const e = err.error;

  if (e instanceof GrammyError) {
    console.error(`Error in request ${e.description}`);
  } else if (e instanceof HttpError) {
    console.error(`Could not contact Telegram`, e);
  } else {
    console.log("Unknown error", e);
  }
});

bot.start();
