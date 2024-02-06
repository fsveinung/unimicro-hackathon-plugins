import { Utils } from "../libs/utils.js";
import { myCss } from "./style.css";
import { template } from "./bundled.html";
import { ChatApi } from "./chatapi.js";
import { CommandHandler } from "./commandHandler.js";

class MicroPlugin extends HTMLElement {

  
  _api;
  _user;
  _userid;
  _company;
  
  constructor() {
    super();
    this._api = null;
    this._userid = undefined;
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
    let commandText = txtInput.value;
    if (!commandText) commandText = txtInput.getAttribute("placeholder");

    this.outputMessage(commandText, false);
    // Clear the inputfield
    txtInput.value = "";

    this.toggleSpinner(true);

    const chatApi = new ChatApi(this._api);
    var result = await chatApi.chat(commandText);

    var handler = new CommandHandler(this._api.http, this._userid, (type, msg) => {
      this.outputMessage(msg, true);
      this.toggleSpinner(false);
    });

    var msg = Utils.trimLeadingLineBreaks(result.Text);
    handler.handleCommand(msg);
    console.log(msg);
    //this.outputMessage(msg, true);
    
  }

  toggleSpinner(on) {
    var outlet = document.getElementById("chat-outlet");
    if (on) {
      const spinnerContainer = Utils.create("div", undefined, "id", "spinner");
      spinnerContainer.appendChild(Utils.create("div", undefined, "class", "spinner", "style", "width: 30px; height: 30px"));
      outlet.appendChild(spinnerContainer);
      return;      
    }
    document.getElementById("spinner")?.remove();
  }

  outputMessage(text, isBot) {
    var outlet = document.getElementById("chat-outlet");
    if (outlet) {
      const cls = "chat-message " + (isBot ? "msg-left" : "msg-right");
      const msg = Utils.create("p", text, "class", cls);
      const row = Utils.create("div", undefined, "class", "chat-row");
      row.appendChild(msg);
      outlet.appendChild(row);
      row.scrollIntoView();
    }
  }

  addComponents() {
    if (!this._api?.factory) { console.log("No factory"); return; }
  }

  async updateContent() {
    if (this._api) {
      debugger;
      const user = await this._api.http.get("/api/biz/users?action=current-session");
      this._user = user;
      this._userid = user?.ID ?? 0;
      this.outputMessage(`Hei ${this._user.DisplayName ?? "der"}, skriv en kommando så skal jeg prøve å utføre den ?`, true);
    }
  }


}

if (Utils.defineComponent("bundled-plugin", MicroPlugin)) {
  Utils.addStyleSheet("bundled-spinnerstylesheet", myCss);
}

