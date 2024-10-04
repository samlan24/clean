let whitelist = [];
let activeTabId = null;

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
  activeTabId = activeInfo.tabId;
  chrome.storage.local.set({ [activeInfo.tabId]: new Date().getTime() }, () => {
    console.log(`Tab ${activeInfo.tabId} activated at ${new Date().getTime()}`);
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getWhitelist') {
    sendResponse({ whitelist });
  } else if (message.action === 'addToWhitelist') {
    const normalizedUrl = normalizeUrl(message.url);
    if (!whitelist.includes(normalizedUrl)) {
      whitelist.push(normalizedUrl);
    }
    sendResponse({ whitelist });
  } else if (message.action === 'removeFromWhitelist') {
    whitelist = whitelist.filter(url => url !== normalizeUrl(message.url));
    sendResponse({ whitelist });
  }
});

// Normalize URL function
const normalizeUrl = (url) => {
  try {
    const { protocol, hostname, pathname } = new URL(url);
    return `${protocol}//${hostname}${pathname}`;
  } catch (e) {
    return url; // Return original if URL is invalid
  }
};

// Function to check for inactive tabs and close them if they are not in the whitelist
const checkForInactiveTabs = () => {
  chrome.tabs.query({}, (tabs) => {
    const now = new Date().getTime();
    tabs.forEach((tab) => {
      chrome.storage.local.get([tab.id.toString()], (result) => {
        const lastActive = result[tab.id.toString()];
        if (lastActive && now - lastActive > 30 * 1000) { // Check for inactivity over 30 seconds
          const normalizedUrl = normalizeUrl(tab.url);
          // Close the tab only if it's not in the whitelist and not the active tab
          if (!whitelist.includes(normalizedUrl) && tab.id !== activeTabId) {
            console.log(`Closing tab ${tab.id} with URL ${tab.url}`);
            chrome.tabs.remove(tab.id);
          } else {
            console.log(`Tab ${tab.id} with URL ${tab.url} is in the whitelist or is the active tab`);
          }
        }
      });
    });
  });
};

// Check for inactive tabs every 30 seconds
setInterval(checkForInactiveTabs, 30000);