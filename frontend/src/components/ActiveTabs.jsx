import React from 'react';

const ActiveTabs = ({ tabs, addToWhitelist }) => {
  return (
    <div>
      <h2>Active Tabs</h2>
      <ul>
        {tabs.map((tab, index) => (
          <li key={index}>
            {tab.title} - <button onClick={() => addToWhitelist(tab.url)}>Whitelist</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActiveTabs;