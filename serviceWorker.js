chrome.webRequest.onBeforeRequest.addListener(
  function (details) {
    console.log("request came in");
    if (details.tabId !== -1) {
      fetch(details.url)
        .then(function (response) {
          return response.text();
        })
        .then(function (data) {
          chrome.tabs.query(
            { active: true, currentWindow: true },
            function (tabs) {
              console.log(tabs);
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
