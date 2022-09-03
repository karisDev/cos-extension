chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.event == "onQuizDataLoaded") {
    const quizData = JSON.parse(request.data.replace(/ajaxData = |;/g, ""));
    handleData(quizData);
  }
  sendResponse({ received: true });
});

function handleData(quizData) {
  const instructions = parseQuiz(quizData);
  createUIandSolve(instructions);
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

function createUIandSolve(instructions) {
  waitForElement("#content-course-ext", () => {
    const iframe = document
      .getElementById("content-course-ext")
      .getElementsByTagName("iframe")[0];
    const sections =
      iframe.contentWindow.document.getElementsByClassName("content-wrap");
    iframe.contentWindow.document.getElementsByClassName("btn green-btn")[0];
    waitForSections(sections, () => {
      //add styles to iframe
      let a = chrome.runtime.getURL("cos_style.css");
      let link = document.createElement("link");
      const head =
        iframe.contentWindow.document.getElementsByTagName("head")[0];
      link.setAttribute("rel", "stylesheet");
      link.setAttribute("type", "text/css");
      link.setAttribute("href", `${a}`);
      head.appendChild(link);

      instructions.map((instruction, index) => {
        console.log("adding ", instruction);
        sections[index].children[0].insertAdjacentHTML(
          "beforebegin",
          `
          <div class="cos_container">
          <h1 style="margin:0; padding:0">${instruction.answers.join(", ")}</h1>
          </div>
          `
        );
      });
    });
  });
}

var manifest = chrome.runtime.getManifest();
console.log("connected to the page Cambridge One Solver v" + manifest.version);
