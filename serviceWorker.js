chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.toDo === "wakeUpWorker") {
    sendResponse("worker is awake");
  }
});

// данный service worker необходим потому что на кэмбридже действует cors, который закрыл доступ к файлу data.js
chrome.webRequest.onCompleted.addListener(
  function (details) {
    if (!details.initiator.includes("cambridgeone.org")) {
      return;
    }
    fetch(details.url)
      .then((response) => response.text())
      .then((data) => {
        try {
          chrome.tabs.query({}, function (tabs) {
            tabs.forEach((tab) => {
              if (tab.favIconUrl && tab.favIconUrl.includes("cambridge")) {
                chrome.tabs.sendMessage(tab.id, {
                  event: "onQuizDataLoaded",
                  data: data,
                });
              }
            }),
              function (response) {};
          });
        } catch {}
      });
  },
  { urls: ["https://content.cambridgeone.org/*/data.js"] },
  ["extraHeaders"]
);

console.log("cos service worker loaded");
