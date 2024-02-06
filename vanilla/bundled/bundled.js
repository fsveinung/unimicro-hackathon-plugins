import { Utils } from "../libs/utils.js";
import { myCss } from "./style.css";
import { template } from "./bundled.html";
import { ChatApi } from "../libs/chatapi.js";

class MicroPlugin extends HTMLElement {
  constructor() {
    super();
    this._api = null;
    this._company = null;
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
        setTimeout(() => { this.addComponents(); }, 0);
      } else {
        this.updateContent();
      }
    }
  }

  createContent() {
    this.appendChild(
      Utils.createFromTemplate(template, "chat-form:submit", async (evt) => this.onSubmit(evt))
    );

  }

  async onSubmit(event) {

    event?.preventDefault();

    // Fetch input-value
    const txtInput = document.getElementById("chat-input");
    if (!txtInput) return;
    const commandText = txtInput.value;
    // Clear the inputfield
    txtInput.value = "";

    var outlet = document.getElementById("chat-outlet");

    //add spinner
    outlet.appendChild(Utils.create("div", undefined, "class", "spinner", "id", "spinner", "style", "width: 30px; height: 30px"));

    const chatApi = new ChatApi(this._api);
    var result = await chatApi.chat(commandText ?? "Hva er banksaldo?");

    // Remove spinner
    document.getElementById("spinner")?.remove();

    console.log(result);
    var outlet = document.getElementById("chat-outlet");
    if (outlet) {
      outlet.appendChild(Utils.create("p", Utils.trimLeadingLineBreaks(result.Text)));
    }
    
  }

  addComponents() {
    if (!this._api?.factory) { console.log("No factory"); return; }
  }

  async updateContent() {
    if (this._api) {
      // todo: .. ned to fetch anything?
    }
  }


}

if (Utils.defineComponent("bundled-plugin", MicroPlugin)) {
  Utils.addStyleSheet("bundled-spinnerstylesheet", myCss);
}

