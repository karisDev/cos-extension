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
    setTimeout(() => waitForSections(sections, callback), 1500);
  }
}

function createUIandSolve(instructions) {
  waitForElement("#content-course-ext", () => {
    const iframe = document
      .getElementById("content-course-ext")
      .getElementsByTagName("iframe")[0];
    const sections =
      iframe.contentWindow.document.getElementsByClassName("content-wrap");
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
        try {
          sections[index].children[0].insertAdjacentHTML(
            "beforebegin",
            `
            <div class="cos_container">
            <h1>${instruction.answers.join("<br>")}</h1>
            </div>
            `
          );
        } catch {
          console.log("it was unsuccessful (-_-). i hope its just :Present:");
          console.log(sections, index);
        }
      });

      // done with ui
      solveTest(instructions);
    });
  });
}

const findElementByXpath = (path) => {
  return document.evaluate(
    path,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue;
};

const navigateNextTask = () => {
  const checkBtn = findElementByXpath('//a[text()="Check"]');
  if (checkBtn) {
    checkBtn.click();
  }
  const nextBtn = findElementByXpath('//a[text()="Next"]');
  if (nextBtn) {
    nextBtn.click();
  }
};

const textEntrySolver = (answers, iframe) => {
  const inputs = iframe.getElementsByTagName("input");
  answers.map((answer, index) => {
    inputs[index].value = answer;
    inputs[index].dispatchEvent(new Event("change"));
  });
};
const choiceSolver = (answers, iframe) => {
  const xpath = `//span[@text()=${answers[0]}]`;
  console.log(findIframeElementByXpath(xpath, iframe));
  // findIframeElementByXpath(xpath, iframe).click();
};
const inlineChoiceSolver = (answers, iframe) => {};

async function solveTest(instructions) {
  const startUrl = document.location.href;
  const iframe = document
    .getElementById("content-course-ext")
    .getElementsByTagName("iframe")[0];
  const sections =
    iframe.contentWindow.document.getElementsByClassName("content-wrap");
  do {
    try {
      // await new Promise((r) => setTimeout(r, 10));
      await new Promise((r) => setTimeout(r, 5000));
      const currentSection = Array.prototype.slice
        .call(sections)
        .findIndex((section) =>
          section.getAttribute("style").includes("display: flex;")
        );
      const answers = instructions[currentSection].answers;
      const sectionIframe = sections[currentSection];
      switch (instructions[currentSection].taskType) {
        case "Input:Completion:Text gap": // textEntryInteraction
          textEntrySolver(answers, sectionIframe);
          navigateNextTask();
          break;
        case "Identify:Select:Radiobutton": // choiceInteraction
          choiceSolver(answers, sectionIframe);
          break;
        case "Identify:Select:Checkbox": // choiceInteraction
          choiceSolver(answers, sectionIframe);
          break;
        case "Identify:Select:Dropdown": // inlineChoiceInteraction
          inlineChoiceSolver(answers, sectionIframe);
          break;
        case "Order:Match:Text gap": // gapMatchInteraction
          textEntrySolver(
            instructions[currentSection].answers,
            sections[currentSection]
          );
          submitBtn.click();
          break;
        case "Present:Present:Present": // present
          navigateNextTask();
          break;
        case "Order:Sort:Sorting": // todo
          break;
        default:
          break;
      }
      if (
        sections[currentSection].getAttribute("class").includes("end-result")
      ) {
        console.log("done");
        return;
      }
    } catch (e) {
      console.log("cos has a problem with this section: ", e);
    }
  } while (startUrl == document.location.href);
}

var manifest = chrome.runtime.getManifest();
console.log("connected to the page Cambridge One Solver v" + manifest.version);
