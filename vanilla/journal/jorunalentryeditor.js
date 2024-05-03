import { Utils } from "../libs/utils.js";
import { Api } from "../libs/api.js";
import { styles } from "./style.css";
import { template } from "./template.html";
import { DataService } from './lib/dataservice.js';
import { JournalSession } from "./lib/journalsession.js";

class JournalEntryEditor extends HTMLElement {
    
    _session;
    _httpApi;
    _dataService;

    set api(ref) {
        this._api = ref;
        this._httpApi = new Api(ref.http, err => this.errHandler(err));
        this._dataService = new DataService(ref.http);
        this._session = new JournalSession(this._dataService);
        this.updateUserInterface();
      }    
    
    constructor() {
        super();
    }

    connectedCallback() {
        this.checkContent();
    }
    
    errHandler(err) {
        console.error(err);
    }

    checkContent() {
        if (this.ownerDocument.defaultView) {
            if (this.childNodes.length == 0) {
                // Create initial content
                this.appendChild( Utils.createFromTemplate(template) );
            } else {
                this.updateUserInterface();
            }
        }
    }

    async updateUserInterface() {
        await this._session.initialize();
        this.addRow();
    }

    addRow() {
        const row = this._session.addRow();
        const table = this.ownerDocument.getElementById("editor");
        const tBody = table.querySelector("tbody");
        const tr = Utils.create("tr");
        tBody.append(tr);
    }

}

if (Utils.defineComponent("journal-plugin", JournalEntryEditor)) {
    Utils.addStyleSheet("journal-plugin-stylesheet", styles);
}
  