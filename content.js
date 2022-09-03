chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.event == "onQuizDataLoaded") {
    const quizData = JSON.parse(request.data.replace(/ajaxData = |;/g, ""));
    handleData(quizData);
  }
  sendResponse({ received: true });
});

function handleData(quizData) {
  const instructions = parseQuiz(quizData);
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
        console.log("adding", instruction);
        sections[index].insertAdjacentHTML(
          "beforeend",
          `
          <div style="width:100%; height:100%; background-color:#00000050">
          <h1>${instruction.answers.join(", ")}</h1>
          </div>
          `
        );
      });
    });
  });
}

var manifest = chrome.runtime.getManifest();
console.log("connected to the page Cambridge One Solver v" + manifest.version);
