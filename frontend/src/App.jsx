import React, { useState, useEffect } from 'react';
import ActiveTabs from './components/ActiveTabs';
import WhitelistedTabs from './components/WhitelistedTabs';

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
      <h1>Clean Tab Manager</h1>
      <ActiveTabs tabs={tabs} addToWhitelist={addToWhitelist} />
      <WhitelistedTabs whitelist={whitelist} removeFromWhitelist={removeFromWhitelist} />
    </div>
  );
};

export default App;