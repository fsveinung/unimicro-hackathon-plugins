import { Utils } from "../libs/utils.js";
import { Api } from "../libs/api.js";
import { styles } from "./style.css";
import { template } from "./template.html";
import { DataService } from '../libs/dataservice.js';
import { JournalSession } from "./lib/journalsession.js";
import { Table } from "../libs/editable/table.js";
import { ToolbarComponent } from "../libs/toolbar/toolbar.js";

class JournalEntryEditor extends HTMLElement {
    
    /** @type {JournalSession} */ #session;
    /** @type {Table} */ #editable;
    /** @type {DataService} */ #dataService;
    /** @type {Api} */ #httpApi;

    set api(ref) {
        this.#httpApi = new Api(ref.http, err => this.#errHandler(err));
        this.#dataService = new DataService(ref.http);
        this.#session = new JournalSession(this.#dataService);
        this.#updateUserInterface();
      }    
    
    constructor() {
        super();
    }

    connectedCallback() {
        this.#checkContent();
    }
    
    #errHandler(err) {
        console.error(err);
    }

    #checkContent() {
        if (this.ownerDocument.defaultView) {
            if (this.childNodes.length == 0) {
                // Create initial content
                this.appendChild( Utils.createFromTemplate(template) );
            } else {
                this.#updateUserInterface();
            }
        }
    }

    async #updateUserInterface() {
        await this.#session.initialize();
        this.#setupTable(this.#session.fields);

    }

    #setupTable(fields) {
        if (this.#editable) return;
        this.#editable = new Table();
        this.#editable.setup(fields, true, this.querySelector("#journalentry"));
        //this.appendChild());
        this.#editable.eventMap.on("change", change => {
            this.#session.setValue(change.field.name, change.value, change.rowIndex);
            return true;
        });
        this.#editable.addRows(10);
        this.#editable.focus(true);
    }

}

if (Utils.defineComponent("journal-plugin", JournalEntryEditor)) {
    Utils.addStyleSheet("journal-plugin-stylesheet", styles);
}
  