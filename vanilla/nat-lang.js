class MicroPlugin extends HTMLElement {
  constructor() {
    super();
    this._api = null;
    this._company = null;
    this._title = "Natural Language";
  }

  connectedCallback() {
    this.updateUserInterface();
  }

  set api(v) {
    this._api = v;
    this.updateUserInterface();
  }

  updateUserInterface() {
    if (this.ownerDocument.defaultView) {
      if (this.childNodes.length == 0) {
        this.createContent();
        setTimeout(() => { this.setupComponents(); }, 0);
      } else {
        this.updateContent();
      }
    }
  }

  createContent() {
    this.appendChild(this.html("h1", "..", "id", "plugin-title"));
    const content = this.html("article", undefined, "class", "mb-4", "style", "min-height: 26em");
    content.appendChild(this.html("button", "Chat", "class", "c2a", "click", async () => {
      var result = await this._api.http.post('/api/comments?action=generate',
      {
        "Temperature": 100,
        "Prompt": "Fortell en morsom historie på 3 setninger der du er selvironisk på vegne av kunstig inteligens",
        "TopPercentage": 100
      });
      console.log(result);
    }))
    this.appendChild(content);
    //this.appendChild(this.createFooter());
  }

  setupComponents() {
    if (!this._api?.factory) { console.log("No factory"); return; }
  }

  async updateContent() {
    if (this._api) {
        this._company = await this._api.http.get('/api/biz/companysettings/1?select=CompanyName');
        const title = document.getElementById("plugin-title");
        if (title) {
            title.innerText = `${this._title} for ${this._company.CompanyName}`;
        }
    }
  }

  // Helper to create html-elements
  html(type, text, ...attribs) {
    const el = document.createElement(type);
    if (text) {
      el.innerText = text;
    }
    if (attribs.length > 0) {
      for (var i = 0; i < attribs.length; i+=2) {
        if (typeof attribs[i+1] === "function") {
            el.addEventListener(attribs[i], attribs[i+1]);
        } else {
            el.setAttribute(attribs[i], attribs[i+1]);
        }
      }
    }
    return el;
  }

}

customElements.define("nat-lang", MicroPlugin);