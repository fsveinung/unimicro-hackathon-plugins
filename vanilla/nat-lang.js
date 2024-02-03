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
    const content = this.html("div", undefined, "style", "min-height: 26em");
    content.appendChild(this.html("button", "Humor?", "class", "c2a", "click", async () => this.onBtnClick()));
    content.appendChild(this.html("div", undefined, "id", "chat-outlet"));
    this.appendChild(content);
  }

  async onBtnClick() {

    var outlet = document.getElementById("chat-outlet");

    //add spinner
    outlet.appendChild(this.html("div", undefined, "class", "spinner", "id", "spinner", "style", "width: 30px; height: 30px"));

    var result = await this._api.http.post('/api/biz/comments?action=generate',
    {
      "Temperature": 10,
      "Prompt": "Fortell en morsom historie på maks 3 setninger der du er selvironisk på vegne av kunstig inteligens",
      "TopPercentage": 10
    });

    // Remove spinner
    document.getElementById("spinner")?.remove();

    console.log(result);
    var outlet = document.getElementById("chat-outlet");
    if (outlet) {
      outlet.appendChild(this.html("p", Utils.trimLeadingLineBreaks(result.Text)));
    }
    
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


class Utils {

  static trimLeadingLineBreaks(value) {
    if (value && value.startsWith("\n")) 
      return this.trimLeadingLineBreaks(value.substring(1));
    return value;
  }

  static addStyleSheet(css) {
    var style = document.createElement("style");
    style.innerText = css;
    document.getElementsByTagName("body")[0].appendChild(style);    
  }

}


try {

  customElements.define("nat-lang", MicroPlugin);
  Utils.addStyleSheet(`
  .spinner {
    margin: 0.5rem;
    display: inline-block;
    border: 5px solid rgba(192,192,225,.3);
    border-radius: 50%;
    border-top-color: #ccc;
    animation: spin 1s ease-in-out infinite;
    -webkit-animation: spin 1s ease-in-out infinite;
  }

  @keyframes spin {
    to { -webkit-transform: rotate(360deg); }
  }
  @-webkit-keyframes spin {
    to { -webkit-transform: rotate(360deg); }
  }`);

} catch {

}
