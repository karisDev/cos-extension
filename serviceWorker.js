chrome.webRequest.onBeforeRequest.addListener(
  function (details) {
    if (details.tabId !== -1) {
      fetch(details.url)
        .then(function (response) {
          return response.text();
        })
        .then(function (data) {
          chrome.tabs.query(
            { active: true, currentWindow: true },
            function (tabs) {
              chrome.tabs.sendMessage(
                tabs[0].id,
                {
                  toDo: "onQuizDataLoaded",
                  data: data,
                },
                function (response) {}
              );
            }
          );
        });
    }
  },
  { urls: ["*://content.cambridgeone.org/*/data.js"] },
  ["extraHeaders"]
);
