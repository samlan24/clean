import React, { useState, useEffect } from 'react';

const ClosedTabs = ({ reopenTab }) => {
  const [closedTabs, setClosedTabs] = useState([]);

  useEffect(() => {
    // Fetch the closed tabs from the backend
    fetch("http://localhost:5000/closed-tabs")
      .then((response) => response.json())
      .then((data) => setClosedTabs(data.closed_tabs));
  }, []);

  return (
    <div>
      <h2>Closed Tabs</h2>
      <ul>
        {closedTabs.map((tab, index) => (
          <li key={index}>
            <span>{tab.title} - {tab.url}</span>
            <button onClick={() => reopenTab(tab)}>Reopen</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ClosedTabs;