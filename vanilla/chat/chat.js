import { Utils } from "../libs/utils.js";
import { myCss } from "./style.css";
import { template } from "./chat.html";
import { ChatApi } from "./libs/chatApi.js";
import { CommandHandler } from "./libs/commandHandler.js";
import { ChatLog } from "./libs/chatLogg.js";
import { speech } from "./libs/speech.js";

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
      } else {
        this.updateContent();
      }
    }
  }

  createContent() {
    this.appendChild(
      Utils.createFromTemplate(template,
        "chat-form:submit", async (evt) => this.onSubmit(evt),
        "chat-input:keydown", (evt) => this.onInputKey(evt),
        "btnClear:click", () => this.clear(),
        "btnRecord:click", (evt) => { evt.preventDefault(); this.onRecord(); }
    ));

  }

  onInputKey(event) {
    if (event.key === "ArrowUp") {
      this.navHistory(true);
    } else if (event.key === "ArrowDown") {
      this.navHistory(false);
    }
  }

  async onRecord() {
    
    if (speech.isRecording) {
      Utils.setClass(this.ownerDocument.getElementById("btnRecord"), "chat-recording", false);
        const result = await speech.stopRecording();
        if (result && result.text) {
          if (this.setInputText(txt))
          this.sendChatRequest(txt, false);
        }
        
    } else {
      Utils.setClass(this.ownerDocument.getElementById("btnRecord"), "chat-recording", true);
        await speech.startRecording(txt => {
            if (this.setInputText(txt))
              this.sendChatRequest(txt, false);
        });
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

  getInputBox() {
    return this._chatInput;
  }  

  setInputText(txt) {
    const chatInput = this.getInputBox();
    if (!chatInput) return false;
    chatInput.value = txt;
    return true;
  }

  getInputText() {
    const chatInput = this.getInputBox();
    if (!chatInput) return "";
    return chatInput.value ?? "";    
  }

  async onSubmit(event) {
    event?.preventDefault();
    this.sendChatRequest(this.getInputText());
  }

  async sendChatRequest(commandText, usePlaceHolderIfEmpty = true) {

    this.toggleSpinner(false); // hide any active ones

    // Use placeholder (suggestion) ?
    if (usePlaceHolderIfEmpty && !commandText) {

      const chatInput = this.getInputBox();
      commandText = chatInput.getAttribute("placeholder");
      let index = this._sampleCommands.indexOf(commandText) + 1;
      // Reset?
      if (index + 1 > this._sampleCommands.length) index = 0;
      chatInput.placeholder = this._sampleCommands[index];
    }

    if (!commandText) return;

    // Show the users-message
    this.outputMessage(commandText, false);

    // Add to history
    this._commandLogg.add(commandText);

    // Clear the inputfield
    this.setInputText("");

    this.toggleSpinner(true);

    const chatApi = new ChatApi(this._api);

    // Send prompt to open-ai
    chatApi.chat(commandText)
      .then( result => this.handleApiResult(result, commandText))
      .catch( err => this.handleApiError(err));


  }

  handleApiError(err) {
    this.toggleSpinner(false);
    const errMsg = err.status == 404
      ? `Endepunkt for tjeneste er ikke tilgjengelig (${err.status} ${err.error})`
      : err.error;
    this.outputMessage("Beklager. " + errMsg, true, true, false, true);
  }

  handleApiResult(result, commandText)
  {
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
    var outlet = this.ownerDocument.getElementById("chat-outlet");
    if (on) {
      const spinnerContainer = Utils.create("div", undefined, "id", "spinner");
      spinnerContainer.appendChild(Utils.create("div", undefined, "class", "spinner", "style", "width: 30px; height: 30px"));
      outlet.appendChild(spinnerContainer);
      spinnerContainer.scrollIntoView();
      return;
    }
    this.ownerDocument.getElementById("spinner")?.remove();
  }

  outputMessage(text, isBot, isError, isPraise, noSave) {

    const prevItem = this._logg.getLastElement();

    this._logg.add({ text: text, isBot: isBot, isError: isError, isPraise: isPraise });
    if (!noSave) this._logg.save("chatlog");

    if (this._logg.getLength() === 2) {
      Utils.hide(this.ownerDocument.getElementById("btnClear"), false);
    }

    const intoSameBubble = !!prevItem && prevItem.isBot === isBot;

    const outlet = this.ownerDocument.getElementById("chat-outlet");
    if (outlet) {
      const pfx = isError ? this.randomSmiley(isError) : isPraise ? this.randomSmiley(false) : "";
      if (intoSameBubble) {
        const bubble = this.getLastChatBubble();
        if (bubble) {
          bubble.appendChild(Utils.create("br", undefined));
          bubble.appendChild(this.ownerDocument.createTextNode(pfx + text));
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
    const outlet = this.ownerDocument.getElementById("chat-outlet");
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

  async updateContent() {
    this._chatInput = this.ownerDocument.getElementById("chat-input");
    if (this._api) {
      const user = await this._api.http.get("/api/biz/users?action=current-session");
      this._user = user;
      this._userid = user?.ID ?? 0;
      this.loadHistory();
      this._chatInput?.focus();
    }
  }

  loadHistory() {
      const history = new ChatLog();
      history.load("chatlog");
      if (history.getLength() > 0) {
        const items = history.getLogg();
        items.forEach( msg => {
          if (!msg.isBot) {
            this._commandLogg.add(msg.text);
          }
          this.outputMessage(msg.text, msg.isBot, msg.isError, msg.isPraise, true)
        });

      } else {
        this.addWelcomeMessage();
      }
  }

  addWelcomeMessage() {
    this.outputMessage(`Hei ${this._user.DisplayName ?? "der"}, skriv en kommando så skal jeg prøve å utføre den ?`, true);
  }

  clear() {
    Utils.removeChildren(this.ownerDocument.getElementById("chat-outlet"));
    Utils.hide(this.ownerDocument.getElementById("btnClear"), true);
    this._logg.clear();
    this.addWelcomeMessage();
    this._logg.save("chatlog");
    this._chatInput?.focus();
  }

}



if (Utils.defineComponent("bundled-plugin", MicroPlugin)) {
  Utils.addStyleSheet("bundled-spinnerstylesheet", myCss);
}

