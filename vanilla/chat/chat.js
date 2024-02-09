import { Utils } from "../libs/utils.js";
import { myCss } from "./style.css";
import { template } from "./chat.html";
import { ChatApi } from "./libs/chatApi.js";
import { CommandHandler } from "./libs/commandHandler.js";
import { ChatLog } from "./libs/chatLogg.js";

class MicroPlugin extends HTMLElement {

  _api;
  _user;
  _userid;
  _company;

  _sampleCommands = [
    "Hva er banksaldo?", "Hva er resultatet mitt?",
    "Hent ordrene mine!", "Vis produktlisten",
    "Opprett nytt produkt 'USB-Lader' med pris 99",
    "Lag en ordre til 'Jon Terje Aksland'",
    "Legg til produktet 'USB-Lader' på ordren til 'Jon Terje Aksland'",
    "Jeg kom på jobb kl. 07:30 og gikk kl. 15:45 og hadde lunch i 20 minutter"
  ];

  _commandLogg = new ChatLog();
  _logg = new ChatLog();
  _chatInput;

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
      Utils.createFromTemplate(template,
        "chat-form:submit", async (evt) => this.onSubmit(evt),
        "chat-input:keydown", (evt) => this.onInputKey(evt))
    );

  }

  onInputKey(event) {
    if (event.key === "ArrowUp") {
      this.navHistory(true);
    } else if (event.key === "ArrowDown") {
      this.navHistory(false);
    }
  }

  navHistory(moveBack) {

    const msg = moveBack
      ? this._commandLogg.moveBack()
      : this._commandLogg.moveNext();
    if (msg) {
      this._chatInput.placeholder = msg;
    }

  }

  async onSubmit(event) {

    event?.preventDefault();

    this.toggleSpinner(false); // hide any active ones

    // Fetch input-value
    const chatInput = this._chatInput;
    if (!chatInput) return;
    let commandText = chatInput.value;

    // Use placeholder (suggestion) ?
    if (!commandText) {
      commandText = chatInput.getAttribute("placeholder");
      let index = this._sampleCommands.indexOf(commandText) + 1;
      // Reset?
      if (index + 1 > this._sampleCommands.length) index = 0;
      chatInput.placeholder = this._sampleCommands[index];
    }

    // Show the users-message
    this.outputMessage(commandText, false);

    // Add to history
    this._commandLogg.add(commandText);

    // Clear the inputfield
    chatInput.value = "";

    this.toggleSpinner(true);

    const chatApi = new ChatApi(this._api);
    var result = await chatApi.chat(commandText);

    var handler = new CommandHandler(this._api.http, this._userid, (type, msg) => {
      if (type === "unknown") {
        this.outputMessage("...", true);
        this.toggleSpinner(false);
        this.retrywithNaturlaLanguage(commandText);
        return;
      }
      this.outputMessage(msg, true, type == "error", type == "praise");
      this.toggleSpinner(false);
    });

    // Process command
    var msg = Utils.trimLeadingLineBreaks(result.Text);
    try {
      handler.handleCommand(msg);
    } catch (err) {
      this.outputMessage(err, true, true);
      this.toggleSpinner(false);
    }

    console.log(msg);

  }

  async retrywithNaturlaLanguage(commandText) {
    const chatApi = new ChatApi(this._api);
    this.toggleSpinner(true);
    const result = await chatApi.chatNatural(commandText);
    this.toggleSpinner(false);
    if (result) {
      var msg = Utils.trimLeadingLineBreaks(result.Text);
      this.outputMessage(msg, true);
    }
  }

  toggleSpinner(on) {
    var outlet = document.getElementById("chat-outlet");
    if (on) {
      const spinnerContainer = Utils.create("div", undefined, "id", "spinner");
      spinnerContainer.appendChild(Utils.create("div", undefined, "class", "spinner", "style", "width: 30px; height: 30px"));
      outlet.appendChild(spinnerContainer);
      spinnerContainer.scrollIntoView();
      return;
    }
    document.getElementById("spinner")?.remove();
  }

  outputMessage(text, isBot, isError, isPraise, noLogg) {

    const prevItem = this._logg.getLastElement();

    if (!noLogg) {
      this._logg.add({ text: text, isBot: isBot, isError: isError, isPraise: isPraise });
      this._logg.save("chatlog");
    }

    const intoSameBubble = !!prevItem && prevItem.isBot === isBot;

    const outlet = document.getElementById("chat-outlet");
    if (outlet) {
      const pfx = isError ? this.randomSmiley(isError) : isPraise ? this.randomSmiley(false) : "";
      if (intoSameBubble) {
        const bubble = this.getLastChatBubble();
        if (bubble) {
          bubble.appendChild(Utils.create("br", undefined));
          bubble.appendChild(document.createTextNode(pfx + text));
          bubble.scrollIntoView();
        }
      } else {
        const cls = "chat-message " + (isBot ? "msg-left" : "msg-right") + (isError ? " msg-err" : "");
        const msg = Utils.create("p", pfx + text, "class", cls);
        const row = Utils.create("div", undefined, "class", "chat-row");
        row.appendChild(msg);
        outlet.appendChild(row);
        row.scrollIntoView();
      }
    }
  }

  getLastChatBubble() {
    const outlet = document.getElementById("chat-outlet");
    const rows = outlet.querySelectorAll(".chat-row:last-child");
    if (rows?.length === 1) {
      return rows[0].firstChild;
    }
  }

  randomSmiley(isError) {
    const smileys = isError
      ? ["🤫","😐","😶","🤔","😳", "🤪","🥲","🙃"]
      : ["😊","😍","🥰","🤗"];
    const index = Math.floor(Math.random() * smileys.length);
    return smileys[index] +  " ";
  }

  addComponents() {
    if (!this._api?.factory) { console.log("No factory"); return; }
  }

  async updateContent() {
    this._chatInput = document.getElementById("chat-input");
    if (this._api) {
      const user = await this._api.http.get("/api/biz/users?action=current-session");
      this._user = user;
      this._userid = user?.ID ?? 0;

      // Load previous logg?
      this._logg.load("chatlog");
      if (this._logg.getLength()>0) {
        const history = this._logg.getLogg();
        history.forEach( msg => this.outputMessage(msg.text, msg.isBot, msg.isError, msg.isPraise, false));
      } else {
        this.outputMessage(`Hei ${this._user.DisplayName ?? "der"}, skriv en kommando så skal jeg prøve å utføre den ?`, true);
      }

    }

  }

}

if (Utils.defineComponent("bundled-plugin", MicroPlugin)) {
  Utils.addStyleSheet("bundled-spinnerstylesheet", myCss);
}

