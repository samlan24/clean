document.body.innerHTML = `
  <div style="display: flex; justify-content: center; align-items: center; height: 100vh; flex-direction: column;">
    <h1>Tab Suspended</h1>
    <p>Click to reactivate</p>
    <button id="reactivate">Reactivate Tab</button>
  </div>
`;

document.getElementById('reactivate').addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'reactivateTab', tabId: chrome.devtools.inspectedWindow.tabId });
});