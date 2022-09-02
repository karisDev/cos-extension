chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.toDo == "onQuizDataLoaded") {
    const quizData = JSON.parse(request.data.replace(/ajaxData = |;/g, ""));
  }
  sendResponse({ success: true });
});

function handleData() {
  const answers = parseAnswers(quizData);

  console.table(answers);
}

var manifest = chrome.runtime.getManifest();
console.log("loaded Cambridge One Solver extension v" + manifest.version);
