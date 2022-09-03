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
  { urls: ["*://content.cambridgeone.org/*/data.js"] },
  ["extraHeaders"]
);

console.log("cos service worker loaded");
