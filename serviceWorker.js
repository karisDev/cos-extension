chrome.webRequest.onSendHeaders.addListener(
  function (details) {
    if (!details.initiator.includes("cambridgeone.org")) {
      return;
    }
    fetch(details.url)
      .then((response) => response.text())
      .then((data) => {
        chrome.tabs.query(
          { active: true, currentWindow: true },
          function (tabs) {
            console.log(tabs);
            chrome.tabs.sendMessage(
              tabs[0].id,
              {
                event: "onQuizDataLoaded",
                data: data,
              },
              function (response) {}
            );
          }
        );
      });
  },
  { urls: ["*://content.cambridgeone.org/*/data.js"] },
  ["extraHeaders"]
);
