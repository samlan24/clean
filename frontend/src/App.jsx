import React, { useState, useEffect } from 'react';

const App = () => {
  const [tabs, setTabs] = useState([]);
  const [whitelist, setWhitelist] = useState([]);
  const [tabActivity, setTabActivity] = useState({});

  useEffect(() => {
    // Fetch the current tabs
    chrome.tabs.query({}, function (tabs) {
      setTabs(tabs);

      // Initialize the last active time for each tab
      const activity = {};
      tabs.forEach(tab => {
        activity[tab.id] = new Date().getTime();
      });
      setTabActivity(activity);
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

  // Remove tab from whitelist
  const removeFromWhitelist = async (url) => {
    await fetch('http://localhost:5000/remove-from-whitelist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });
    // Update the whitelist UI
    setWhitelist(whitelist.filter((item) => item !== url));
  };

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
          <li key={index}>
            {url} - <button onClick={() => removeFromWhitelist(url)}>Remove from Whiteist</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;