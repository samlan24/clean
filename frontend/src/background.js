let whitelist = [];

chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension Installed');
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    // Save the time the tab became active (or was updated)
    chrome.storage.local.set({ [tabId]: new Date().getTime() }, () => {
      console.log(`Tab ${tabId} updated at ${new Date().getTime()}`);
    });
  }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  // Update the last active time for the active tab
  chrome.storage.local.set({ [activeInfo.tabId]: new Date().getTime() }, () => {
    console.log(`Tab ${activeInfo.tabId} activated at ${new Date().getTime()}`);
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getWhitelist') {
    sendResponse({ whitelist });
  } else if (message.action === 'addToWhitelist') {
    if (!whitelist.includes(message.url)) {
      whitelist.push(message.url);
    }
    sendResponse({ whitelist });
  } else if (message.action === 'removeFromWhitelist') {
    whitelist = whitelist.filter(url => url !== message.url);
    sendResponse({ whitelist });
  }
});

// Function to check for inactive tabs and close them if they are not in the whitelist
const checkForInactiveTabs = () => {
  chrome.tabs.query({}, (tabs) => {
    const now = new Date().getTime();
    tabs.forEach((tab) => {
      chrome.storage.local.get([tab.id.toString()], (result) => {
        const lastActive = result[tab.id.toString()];
        if (lastActive) {
          console.log(`Tab ${tab.id} last active at ${lastActive}`);
        }
        if (lastActive && now - lastActive > 30 * 1000) { // 30 seconds
          if (!whitelist.includes(tab.url)) {
            console.log(`Closing tab ${tab.id} with URL ${tab.url}`);
            chrome.tabs.remove(tab.id);
          }
        }
      });
    });
  });
};

// Check for inactive tabs every 10 seconds
setInterval(checkForInactiveTabs, 10000);