const { parse } = require("path");

class Quiz {
  constructor() {}
}

// finished loading
var manifest = chrome.runtime.getManifest();
console.log("loaded Cambridge One Solver extension v" + manifest.version);
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.toDo == "onQuizDataLoaded") {
    const quizData = JSON.parse(request.data.replace(/ajaxData = |;/g, ""));
    parseAnswers(quizData);
  }
  return true;
});

function parseAnswers(quizData) {}
