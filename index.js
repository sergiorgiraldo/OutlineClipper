const form = document.querySelector('.create-clip');

// New clip

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);

  // Extract form values
  const outlineApiKey = data['outline-api-key'];
  const outlineCollection = data['outline-collection'];
  const outlinePage = data['outline-page'];
  const urlToSave = document.location.href;

  manager.createClip(outlineApiKey, outlineCollection, outlinePage, urlToSave);
});

class ClipManager {
  constructor(d) {
    this.logMessage('Outline clipper: initializing');
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

  createClip(outlineApiKey, outlineCollection, outlinePage, urlToSave) {
    this.logMessage(`Created ${outlineApiKey}\n${outlineCollection}\n${outlinePage}\n${urlToSave}`);
  }
}

const manager = new ClipManager();