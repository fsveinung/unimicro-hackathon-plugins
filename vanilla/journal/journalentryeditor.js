import { Utils } from "../libs/utils.js";
import { Api } from "../libs/api.js";
import { styles } from "./style.css";
import { template } from "./template.html";
import { DataService } from '../libs/dataservice.js';
import { JournalSession } from "./lib/journalsession.js";
import { Editable } from "./lib/editable.js";

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
        this.addRows(10);
        this._editable.focus();
    }

    setupTable(map) {
        const table = this.getEditor();
        
        this._editable = new Editable();
        this._editable.init(table, map);

        if (!table) { console.log("No table"); return; }
        let thead = table.querySelector("thead");
        if (!thead) {
            thead = Utils.create("thead");
            table.appendChild(thead);
        } else {
            thead.querySelectorAll("*").forEach(n => n.remove());
        }
        const tr = Utils.create("tr");
        for (const [key, col] of map) {
            const td = Utils.create("th", col.label, "class", col.type);
            tr.appendChild(td);
        }
        thead.appendChild(tr);
    }

    getEditor() {
        return this.ownerDocument.getElementById("editor");
    }

    addRows(count) {
        const map = this._session.columns;
        const table = this.getEditor();
        let tBody = table.querySelector("tbody");
        if (!tBody) {
            tBody = Utils.create("tbody");
            table.appendChild(tBody);
        }
        for (let i = 0; i < (count || 1); i++) {
            const row = this._session.addRow();
            const tr = Utils.create("tr");
            for (const [key, col] of map) {
                const td = Utils.create("td", "", "class", col.type);
                tr.appendChild(td);
            }        
            tBody.append(tr);
        }
    }

}

if (Utils.defineComponent("journal-plugin", JournalEntryEditor)) {
    Utils.addStyleSheet("journal-plugin-stylesheet", styles);
}
  