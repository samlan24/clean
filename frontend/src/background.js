chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension Installed');
  });

  chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete') {
      // Save the time the tab became active (or was updated)
      tab.lastActive = new Date().getTime();
    }
  });
