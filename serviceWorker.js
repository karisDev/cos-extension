console.log("cos service worker is silently working");
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
                  event: "onQuizDataLoaded",
                  data: data,
                },
                function (response) {
                  if (chrome.runtime.lastError) {
                    setTimeout(tabs[0].id, 1000);
                  } else {
                    console.log(
                      "cos service worker successfully catched data.js"
                    );
                  }
                }
              );
            }
          );
        });
    }
  },
  { urls: ["*://content.cambridgeone.org/*/data.js"] },
  ["extraHeaders"]
);
