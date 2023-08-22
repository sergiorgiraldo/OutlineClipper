chrome.action.onClicked.addListener(openSavePage);

function openSavePage() {
  chrome.tabs.create({ url: 'index.html' });
}
