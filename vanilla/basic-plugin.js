class MicroPlugin extends HTMLElement {
  constructor() {
    super();
    this._api = null;
    this._company = null;
    this._title = "Lånesøknad";
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
      } else {
        this.updateContent();
      }
    }
  }

  createContent() {
    const content = this.html("section");
    content.appendChild(this.html("h1", this._title, "id", "plugin-title"));
    content.appendChild(this.html("h2", "Lånebeløp"));
    content.appendChild(this.html("input", undefined, "type", "text"));
    const footer = this.html("footer", undefined, "class", "mt-4 flex");
    footer.appendChild(this.html("button", "Hjelp", "class", "secondary", "click", () => {
        this._api.showAlert("Help is on the way!!");
    }));
    footer.appendChild(this.html("button", "Videre", "class", "c2a", "click", () => {
        this._api.showAlert("Take us to the next step!");
    }));
    content.appendChild(footer);
    this.appendChild(content);    
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

customElements.define("micro-plugin", MicroPlugin);