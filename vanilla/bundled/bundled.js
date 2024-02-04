import { Utils } from "../libs/utils.js";
import { myCss } from "./style.css";

class MicroPlugin extends HTMLElement {
  constructor() {
    super();
    this._api = null;
    this._company = null;
    this._title = "Kommandoline";
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
    this.appendChild(Utils.create("h1", "..", "id", "plugin-title"));
    const content = Utils.create("div", undefined, "style", "min-height: 26em");
    content.appendChild(Utils.create("button", "Humor?", "class", "c2a", "click", async () => this.onBtnClick()));
    content.appendChild(Utils.create("div", undefined, "id", "chat-outlet"));
    this.appendChild(content);
  }

  async onBtnClick() {

    var outlet = document.getElementById("chat-outlet");

    //add spinner
    outlet.appendChild(Utils.create("div", undefined, "class", "spinner", "id", "spinner", "style", "width: 30px; height: 30px"));

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
      outlet.appendChild(Utils.create("p", Utils.trimLeadingLineBreaks(result.Text)));
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


}

// Register component:
if (Utils.defineComponent("bundled-plugin", MicroPlugin)) {
  Utils.addStyleSheet("bundled-spinnerstylesheet", myCss);
}

