chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.event == "onQuizDataLoaded") {
    const quizData = JSON.parse(request.data.replace(/ajaxData = |;/g, ""));
    handleData(quizData);
  }
  sendResponse({ success: true });
});

function handleData(quizData) {
  const instructions = parseQuiz(quizData);
  console.log(instructions);
  createUI(instructions);
}

function waitForElement(selector, callback) {
  if (document.querySelector(selector)) {
    callback();
  } else {
    setTimeout(() => waitForElement(selector, callback), 1000);
  }
}

function waitForSections(sections, callback) {
  if (sections.length > 0) {
    callback();
  } else {
    setTimeout(() => waitForSections(sections, callback), 1000);
  }
}

function createUI(instructions) {
  waitForElement("#content-course-ext", () => {
    const iframe = document
      .getElementById("content-course-ext")
      .getElementsByTagName("iframe")[0];
    const sections =
      iframe.contentWindow.document.getElementsByClassName("content-wrap");

    waitForSections(sections, () => {
      instructions.map((instruction, index) => {
        const h1 = document.createElement("h1");
        h1.innerHTML = instruction.answers.join(", ");
        sections[index].appendChild(h1);
      });
    });
  });
}

var manifest = chrome.runtime.getManifest();
console.log("connected to the page Cambridge One Solver v" + manifest.version);
