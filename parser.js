String.prototype.replaceLooseChars = function () {
  return this.replace(/&amp|&ampamp/g, "&amp;amp;")
    .replace(/&lt/g, "&lt;")
    .replace(/&gt/g, "&gt;")
    .replace(/&quot/g, "&quot;");
};

NodeList.prototype.toArray = HTMLCollection.prototype.toArray = function () {
  return Array.prototype.slice.call(this);
};

const taskTypes = {
  "Input:Completion:Text gap": "textEntryInteraction", // Текстовое поле
  "Identify:Select:Radiobutton": "choiceInteraction", // Радио-кнопка
  "Identify:Select:Checkbox": "choiceInteraction", // Чекбокс
  "Identify:Select:Dropdown": "inlineChoiceInteraction", // Комбобокс
  "Order:Match:Text gap": "gapMatchInteraction", // Перетаскивание элементов
  "Present:Present:Present": null, // Информация без задания или запись голоса
  "Order:Sort:Sorting": "gapMatchInteraction", // Перетаскивание элементов, но особенное
};
function parseQuiz(quizData) {
  // сортируем задания по cat id как указано в файле LearningObjectInfo.xml
  const regex = /cat(.*?).xml/g;
  const tasksOrder = quizData["LearningObjectInfo.xml"].match(regex);
  delete quizData["LearningObjectInfo.xml"];

  // проходим по каждому заданию парсером
  const xmlParser = new DOMParser();
  const tasks = tasksOrder.map((taskID) => {
    const taskXML = xmlParser.parseFromString(
      quizData[taskID].replaceLooseChars(),
      "text/xml"
    );
    // тип задания, например "Input:Completion:Text gap"
    const taskIdentifier =
      taskXML.getElementsByTagName("assessmentItem")[0].attributes.identifier
        .nodeValue;
    // коллекция содержащая ID верных ответов
    const responseDeclaration = taskXML.getElementsByTagName(
      "responseDeclaration"
    );
    // коллекция соддержащая варианты ответа и ID задания
    const interactionsCollection = taskXML.getElementsByTagName(
      taskTypes[taskIdentifier]
    );

    // пробегаемся по каждому полю ответов
    const answers = responseDeclaration.toArray().map((currentField, i) => {
      if (taskIdentifier == "Input:Completion:Text gap") {
        const correctAnswerID =
          currentField.childNodes[0].childNodes[0].innerHTML;
        return correctAnswerID;
      }
      // получаем ID правильных ответов для поля
      const correctAnswersID = [
        ...new Set(
          currentField.childNodes[0].childNodes
            .toArray()
            .map((value) => value.innerHTML.split(" ")[0])
        ),
      ];

      // проходим по всем ID вариантов и находим в них правильный
      const answers = correctAnswersID.map((answerID) => {
        const fieldAnswer = interactionsCollection[i].childNodes
          .toArray()
          .find(
            (candidate) =>
              candidate.attributes.identifier.nodeValue === answerID
          );
        return fieldAnswer.childNodes[0].nodeValue;
      });

      if (taskIdentifier == "Order:Match:Text gap") {
        return [...new Set(answers)];
      }

      return answers;
    });

    return {
      taskType: taskIdentifier,
      answers,
    };
  });
  return tasks;
}
