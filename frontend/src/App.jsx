import React, { useState, useEffect } from 'react';

const App = () => {
  const [tabs, setTabs] = useState([]);
  const [whitelist, setWhitelist] = useState([]);

  useEffect(() => {
    // Fetch the current tabs
    chrome.tabs.query({}, function (tabs) {
      setTabs(tabs);
    });

    // Fetch the whitelist from the backend
    fetch("http://localhost:5000/whitelist")
      .then((response) => response.json())
      .then((data) => setWhitelist(data.whitelist));
  }, []);

  // Add tab to whitelist
  const addToWhitelist = async (url) => {
    await fetch('http://localhost:5000/add-to-whitelist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });
    // Update the whitelist UI
    setWhitelist([...whitelist, url]);
  };

  // Automatically close inactive tabs after 5 minutes
  const checkForInactiveTabs = () => {
    chrome.tabs.query({}, (tabs) => {
      const now = new Date().getTime();
      tabs.forEach((tab) => {
        // Assume each tab has a last active time (mock logic here)
        if (tab.lastActive && now - tab.lastActive > 5 * 60 * 1000) {
          if (!whitelist.includes(tab.url)) {
            chrome.tabs.remove(tab.id);
          }
        }
      });
    });
  };

  useEffect(() => {
    // Check for inactive tabs every minute
    const interval = setInterval(checkForInactiveTabs, 60000);
    return () => clearInterval(interval);
  }, [whitelist]);

  return (
    <div>
      <h1>Tab Manager</h1>
      <h2>Active Tabs</h2>
      <ul>
        {tabs.map((tab, index) => (
          <li key={index}>
            {tab.title} - <button onClick={() => addToWhitelist(tab.url)}>Whitelist</button>
          </li>
        ))}
      </ul>

      <h2>Whitelisted Tabs</h2>
      <ul>
        {whitelist.map((url, index) => (
          <li key={index}>{url}</li>
        ))}
      </ul>
    </div>
  );
};

export default App;
