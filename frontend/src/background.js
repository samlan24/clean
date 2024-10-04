let activeTabId = null;

// Normalize URL (remove query params, fragment, and trailing slash)
const normalizeUrl = (url) => {
  try {
    const parsedUrl = new URL(url);
    parsedUrl.hash = ''; // Remove anchor/hash
    parsedUrl.search = ''; // Remove query parameters
    return parsedUrl.toString().replace(/\/$/, ''); // Remove trailing slash
  } catch (e) {
    console.error('Invalid URL:', url);
    return url;
  }
};

// Fetch the whitelist from the backend
const fetchWhitelist = async () => {
  try {
    const response = await fetch('http://localhost:5000/whitelist');
    const data = await response.json();
    return data.whitelist.map((url) => normalizeUrl(url)); // Normalize URLs in whitelist
  } catch (error) {
    console.error('Error fetching whitelist:', error);
    return [];
  }
};

// Add a URL to the whitelist
const addToWhitelist = async (url) => {
  try {
    const normalizedUrl = normalizeUrl(url);
    const response = await fetch('http://localhost:5000/add-to-whitelist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: normalizedUrl }),
    });
    const data = await response.json();
    console.log(data.message);
  } catch (error) {
    console.error('Error adding to whitelist:', error);
  }
};

// Remove a URL from the whitelist
const removeFromWhitelist = async (url) => {
  try {
    const normalizedUrl = normalizeUrl(url);
    const response = await fetch('http://localhost:5000/remove-from-whitelist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: normalizedUrl }),
    });
    const data = await response.json();
    console.log(data.message);
  } catch (error) {
    console.error('Error removing from whitelist:', error);
  }
};

// Store closed tab information
const storeClosedTab = async (tab) => {
  try {
    const response = await fetch('http://localhost:5000/store-closed-tab', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tab),
    });
    const data = await response.json();
    console.log(data.message);
  } catch (error) {
    console.error('Error storing closed tab:', error);
  }
};

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
    fetchWhitelist().then((whitelist) => sendResponse({ whitelist }));
    return true; // Keep the message channel open for async response
  } else if (message.action === 'addToWhitelist') {
    addToWhitelist(message.url);
  } else if (message.action === 'removeFromWhitelist') {
    removeFromWhitelist(message.url);
  }
});

// Function to check for inactive tabs and close them if they are not in the whitelist
const checkForInactiveTabs = async () => {
  const whitelist = await fetchWhitelist();
  chrome.tabs.query({}, (tabs) => {
    const now = new Date().getTime();
    tabs.forEach((tab) => {
      chrome.storage.local.get([tab.id.toString()], (result) => {
        const lastActive = result[tab.id.toString()];
        if (lastActive && now - lastActive > 30 * 1000) { // Check for inactivity over 30 seconds
          const normalizedUrl = normalizeUrl(tab.url);
          console.log(`Checking tab ${tab.id} with URL ${tab.url} (normalized: ${normalizedUrl})`);
          // Close the tab only if it's not in the whitelist and not the active tab
          if (!whitelist.includes(normalizedUrl) && tab.id !== activeTabId) {
            console.log(`Closing tab ${tab.id} with URL ${tab.url}`);
            storeClosedTab({ id: tab.id, url: tab.url, title: tab.title });
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