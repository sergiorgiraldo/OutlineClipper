const form = document.querySelector('.create-clip');

document.addEventListener('DOMContentLoaded', ()=>{
  chrome.storage.local.get("outlineApiStg", function(item){
    document.getElementById("outline-api-key").value = item.outlineApiStg;
    loadCollections();
  });

  manager.parseClip();
});

form.addEventListener('submit', (event)=>{
  event.preventDefault();
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);

  const outlineApiKey = data['outline-api-key'];
  const outlineCollection = data['outline-collection'];
  const outlinePage = data['outline-page'];

  manager.createClip(outlineApiKey, outlineCollection, outlinePage);
});

document.getElementById("outline-api-key").addEventListener('change', ()=>{
  loadCollections();
});

function loadCollections(){
  const key = document.getElementById("outline-api-key").value;
  if (key == "") return;

  fetch("https://husk-dusk.nl/api/collections.list",{
    method: "POST",
    headers: {
      "Authorization": "Bearer " + key,
      "Content-Type": "application/json",
      "Accept": "application/json",
    }    
  }).then(function (response) {
    let selectElement = document.getElementById("outline-collection");

    while (selectElement.firstChild) {
      selectElement.removeChild(selectElement.firstChild);
    }

    response.data.forEach(item => {
      let optionElement = document.createElement("option");
      optionElement.value = item.id;
      optionElement.text = item.name;
      selectElement.appendChild(optionElement);
    });    
  })
  .catch(function (err) {
    console.warn('Something went wrong.', err);
  });
}

class ClipManager {
  constructor(d) {
    this.logMessage('Outline clipper: initialized');
  }

  logMessage(message) {
    const date = new Date();
    const pad = (val, len = 2) => val.toString().padStart(len, '0');
    const h = pad(date.getHours());
    const m = pad(date.getMinutes());
    const s = pad(date.getSeconds());
    const ms = pad(date.getMilliseconds(), 3);
    const time = `${h}:${m}:${s}.${ms}`;

    const logLine = `[${time}] ${message}`;

    console.log(logLine);
  }

  parseClip(){
    const urlParams = new URLSearchParams(window.location.search);
    const urlToSave = urlParams.get('u');
  
    fetch(urlToSave).then(function (response) {
      return response.text();
    })
    .then(function (html) {
      var parser = new DOMParser();
      var doc = parser.parseFromString(html, 'text/html');
      const reader = new Readability(doc);
      const article = reader.parse().content;
      document.getElementById("parsed-clip").innerHTML = article;
    })
    .catch(function (err) {
      console.warn('Something went wrong.', err);
    });
  }

  createClip(outlineApiKey, outlineCollection, outlinePage) {
    chrome.storage.local.set({ "outlineApiStg": outlineApiKey }, function(){});
    this.logMessage(`Saved ${outlineCollection}/${outlinePage}`);
  }
}

const manager = new ClipManager();