chrome.action.onClicked.addListener(openSavePage);

function openSavePage() {
  chrome.tabs.query({
    active: true,               
    lastFocusedWindow: true     
  }, 
  function(array_of_Tabs) {
    var tab = array_of_Tabs[0];
    chrome.tabs.create({ url: 'index.html?u=' + encodeURI(tab.url) + '&n=' + tab.title});
  });
}
