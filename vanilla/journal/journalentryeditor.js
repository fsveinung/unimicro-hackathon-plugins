import { Utils } from "../libs/utils.js";
import { Api } from "../libs/api.js";
import { styles } from "./style.css";
import { template } from "./template.html";
import { DataService } from '../libs/dataservice.js';
import { JournalSession } from "./lib/journalsession.js";
import { Table } from "../libs/editable/table.js";

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
        this.#setupTable(this.#session.columns);

    }

    #setupTable(map) {
        if (this.#editable) return;
        this.#editable = new Table();
        this.appendChild(this.#editable.setup(map, true));
        this.#editable.eventMap.on("change", change => this.#onChange(change));
        this.#editable.addRows(10);
        this.#editable.focus(true);
    }

    /**
     * Handle editor-changes
     * @param {{ colName: string, rowIndex: number, value: string, commit: boolean }} change 
     * @returns {boolean} true if update should be allowed
     */
    #onChange(change) {
        console.log("journal-change-event triggered", change);
        return change.value == "2";
        //return true;
    }

}

if (Utils.defineComponent("journal-plugin", JournalEntryEditor)) {
    Utils.addStyleSheet("journal-plugin-stylesheet", styles);
}
  