chrome.runtime.sendMessage({ toDo: "wakeUpWorker" }, (response) => {});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.event == "onQuizDataLoaded") {
    const quizData = JSON.parse(request.data.replace(/ajaxData = |;/g, ""));
    handleData(quizData);
  }
  sendResponse({ received: true });
});

function handleData(quizData) {
  const instructions = parseQuiz(quizData);
  createUiAndCallSolve(instructions);
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

function createUiAndCallSolve(instructions) {
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
          console.log(
            "it was unsuccessful (-_-). pray its just :Present:",
            sections,
            index
          );
        }
      });

      // done with ui and loaded all sections
      solveTest(instructions);
    });
  });
}

const findElementByXpath = (xpath, parent = document) => {
  return document.evaluate(
    xpath,
    parent,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue;
};

const findElementsByXpath = (xpath, parent = document) => {
  let results = [];
  let query = document.evaluate(
    xpath,
    parent,
    null,
    XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
    null
  );
  for (let i = 0, length = query.snapshotLength; i < length; ++i) {
    results.push(query.snapshotItem(i));
  }
  return results;
};

const switchTask = () => {
  const checkBtn = findElementByXpath('//a[text()="Check"]');
  if (checkBtn) {
    checkBtn.click();
  }
  const nextBtn = findElementByXpath('//a[text()="Next"]');
  if (nextBtn) {
    nextBtn.click();
  }
};

const textEntrySolver = (answers, parent) => {
  const inputs = parent.getElementsByTagName("input");
  answers.map((answer, index) => {
    inputs[index].value = answer;
    inputs[index].dispatchEvent(new Event("change"));
  });
};

const choiceSolver = (answers, parent) => {
  answers.forEach((answer) => {
    const xpath = `//span[text()="${answer}"]`;
    console.log(findElementsByXpath(xpath, parent));
    findElementsByXpath(xpath, parent).forEach((el) => el.click());
  });
};

const gapSolver = (answers, parent) => {
  answers.forEach((answer) => {
    const xpath = `//div[@class="content" and text()[contains(.,"${answer[0].slice(
      1
    )}")]]`;
    const matches = findElementsByXpath(xpath, parent);
    matches.forEach((match) => {
      match.click();
    });
  });
};

const inlineChoiceSolver = (answers, parent) => {
  const dropdownXpath = `//div[@class="rich-dropdown"]`;
  const dropdowns = findElementsByXpath(dropdownXpath, parent);
  for (let i = 0; i < dropdowns.length; i++) {
    dropdowns[i].click();
    const correctElementXpath = `//li[text()="${answers[i]}"]`;
    const correctElement = findElementByXpath(
      correctElementXpath,
      dropdowns[i]
    );
    correctElement.click();
  }
};

async function solveTest(instructions) {
  console.log(instructions);
  const startUrl = document.location.href;
  const iframe = document
    .getElementById("content-course-ext")
    .getElementsByTagName("iframe")[0];
  const sections =
    iframe.contentWindow.document.getElementsByClassName("content-wrap");
  do {
    try {
      // await new Promise((r) => setTimeout(r, 10));
      await new Promise((r) => setTimeout(r, 50));
      switchTask();
      await new Promise((r) => setTimeout(r, 50));
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
          break;
        case "Identify:Select:Radiobutton": // choiceInteraction
          choiceSolver(answers, sectionIframe);
          break;
        case "Identify:Select:Checkbox": // choiceInteraction
          choiceSolver(answers, sectionIframe);
          return;
          break;
        case "Identify:Select:Dropdown": // inlineChoiceInteraction
          inlineChoiceSolver(answers, sectionIframe);
          break;
        case "Order:Match:Text gap": // gapMatchInteraction  mh
          gapSolver(answers, sectionIframe);
          break;
        case "Present:Present:Present": // present
          break;
        case "Order:Sort:Sorting": // todo
          gapSolver(answers, sectionIframe);
          return;
          break;
        default:
          break;
      }
      if (
        sections[currentSection].getAttribute("class").includes("end-result")
      ) {
        console.log("cos done solving");
        return;
      }
    } catch (e) {
      console.log("cos has a problem with this section: ", e);
    }
  } while (startUrl == document.location.href);
}

var manifest = chrome.runtime.getManifest();
console.log("connected to the page Cambridge One Solver v" + manifest.version);
