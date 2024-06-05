import { Utils } from "../libs/utils.js";
import { Api } from "../libs/api.js";
import { journalEntryStyles } from "./journalentryeditor.css";
import { journalEntryTemplate } from "./journalentryeditor.html";
import { DataService } from '../libs/dataservice.js';
import { JournalSession } from "./lib/journalsession.js";
import { Table } from "../libs/editable/table.js";
import { ToolbarComponent } from "../libs/toolbar/toolbar.js";

class JournalEntryEditor extends HTMLElement {
    
    /** @type {{ http: any, showAlert: function }} */ #pluginApi;
    /** @type {JournalSession} */ #session;
    /** @type {Table} */ #table;
    /** @type {DataService} */ #dataService;
    /** @type {Api} */ #httpApi;

    set api(ref) {
        this.#pluginApi = ref;
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
                this.appendChild( Utils.createFromTemplate(journalEntryTemplate,
                    "new", () => this.#clear(),
                    "save", () => this.#save()
                ) );
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
        if (this.#table) return;
        this.#table = new Table();
        this.#table.setup(fields, true, this.querySelector("#journalentry"));
        this.#table.eventMap.on("change", change => {
            this.#session.setValue(change.field.name, change.value, change.rowIndex);
            return true;
        });
        this.#clear();
    }

    #clear() {
        this.#session.clear();
        this.#table.addRows(10, true);
        this.#table.focus(true);
    }

    #save() {
        const saveState = this.#session.getState();
        console.log("saveState", saveState);
    }

}

if (Utils.defineComponent("journal-plugin", JournalEntryEditor)) {
    Utils.addStyleSheet("journal-plugin-stylesheet", journalEntryStyles);
}
  