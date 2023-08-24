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

function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

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
  })
  .then(function (response) {
    return response.text();
  })
  .then(function (json) {
    let selectElement = document.getElementById("outline-collection");

    while (selectElement.firstChild) {
      selectElement.removeChild(selectElement.firstChild);
    }
    var o = JSON.parse(json);
    o.data.forEach(item => {
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
    console.log('Outline clipper: initialized');
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
    if (outlineApiKey == "") return;

    chrome.storage.local.set({ "outlineApiStg": outlineApiKey }, function(){});
    var turndownService = new TurndownService();
    var markdown = turndownService.turndown(document.getElementById("parsed-clip"));
    var data = {
      "title": outlinePage,
      "text": markdown,
      "collectionId": outlineCollection,
      "template": false,
      "publish": true
    };

    fetch("https://husk-dusk.nl/api/documents.create",{
      method: "POST",
      headers: {
        "Authorization": "Bearer " + outlineApiKey,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(data)
    })
    .then(function (response) {
      console.log(`Saved ${outlineCollection}/${outlinePage}`);
    })
    .catch(function (err) {
      console.warn('Something went wrong.', err);
    });
  }
}

const manager = new ClipManager();