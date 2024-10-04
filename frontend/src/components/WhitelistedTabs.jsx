import React from 'react';

const WhitelistedTabs = ({ whitelist, removeFromWhitelist }) => {
  return (
    <div>
      <h2>Whitelisted Tabs</h2>
      <ul>
        {whitelist.map((url, index) => (
          <li key={index}>
            {url} - <button onClick={() => removeFromWhitelist(url)}>Remove from Whitelist</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WhitelistedTabs;