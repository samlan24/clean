// Listen for changes in idle state
chrome.idle.onStateChanged.addListener((state) => {
  if (state === "idle") {
      // Query all open tabs
      chrome.tabs.query({}, (tabs) => {
          const currentTime = Date.now();
          const inactivityThreshold = 1 * 60 * 1000; // 1 minute in milliseconds

          // Retrieve the whitelist from storage
          chrome.storage.sync.get(['whitelist'], (result) => {
              const whitelist = result.whitelist || [];

              tabs.forEach((tab) => {
                  // Check if the tab has a lastAccessed property
                  if (tab.lastAccessed && !whitelist.includes(tab.url)) {
                      // Check if the tab has been inactive longer than the threshold
                      if (currentTime - tab.lastAccessed > inactivityThreshold) {
                          // Attempt to remove the tab and handle potential errors
                          chrome.tabs.remove(tab.id, () => {
                              if (chrome.runtime.lastError) {
                                  console.error(`Error removing tab ${tab.id}: ${chrome.runtime.lastError.message}`);
                              } else {
                                  console.log(`Closed tab: ${tab.title}`);
                              }
                          });
                      }
                  }
              });
          });
      });
  }
});