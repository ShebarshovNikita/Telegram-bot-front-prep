const { Random } = require("random-js");
const questions = require("./questions.json");

const getRandomQuestion = (topic) => {
  const random = new Random();

  let questionTopic = topic.toLowerCase();

  if (questionTopic === "случайный вопрос") {
    questionTopic =
      Object.keys(questions)[
        random.integer(0, Object.keys(questions).length - 1)
      ];
  }
  // const randomQuestionIndex = Math.floor(
  //   Math.random() * questions[questionTopic].length
  // );

  const randomQuestionIndex = random.integer(
    0,
    questions[questionTopic].length - 1
  );

  return {
    question: questions[questionTopic][randomQuestionIndex],
    questionTopic: questionTopic,
  };
};

const getCorrectAnswer = (topic, id) => {
  const questionTopic = topic.toLowerCase();
  const question = questions[questionTopic].find(
    (question) => question.id === id
  );

  if (!question.hasOptions) {
    return question.answer;
  }

  return question.options.find((option) => option.isCorrect).text;
};

module.exports = { getRandomQuestion, getCorrectAnswer };
