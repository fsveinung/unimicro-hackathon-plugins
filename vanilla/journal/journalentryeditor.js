import { Utils } from "../libs/utils.js";
import { Api } from "../libs/api.js";
import { styles } from "./style.css";
import { template } from "./template.html";
import { DataService } from '../libs/dataservice.js';
import { JournalSession } from "./lib/journalsession.js";
import { Table } from "../libs/editable/table.js";

class JournalEntryEditor extends HTMLElement {
    
    _session;
    _httpApi;
    _dataService;
    _editable;

    set api(ref) {
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
        this.setupTable(this._session.columns);

    }

    setupTable(map) {
        this._editable = new Table();
        this._editable.setup(this.ownerDocument.getElementById("editor"), map, true);
        this._editable.addRows(10);
        this._editable.focus(true);
    }

}

if (Utils.defineComponent("journal-plugin", JournalEntryEditor)) {
    Utils.addStyleSheet("journal-plugin-stylesheet", styles);
}
  