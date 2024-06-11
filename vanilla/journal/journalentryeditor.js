import { Utils } from "../libs/utils.js";
import { Api } from "../libs/api.js";
import { journalEntryStyles } from "./journalentryeditor.css";
import { journalEntryTemplate } from "./journalentryeditor.html";
import { DataService } from '../libs/dataservice.js';
import { JournalSession } from "./lib/journalsession.js";
import { Table } from "../libs/editable/table.js";
import { ToolbarComponent } from "../libs/toolbar/toolbar.js";
import { JournalEntryVatFeature } from "./lib/features/vat.js";
import { JournalCoreFeature } from "./lib/features/core.js";

class JournalEntryEditor extends HTMLElement {
    
    /** @type {{ http: any, showAlert: function }} */ #pluginApi;
    /** @type {JournalSession} */ #session;
    /** @type {Table} */ #table;
    /** @type {DataService} */ #dataService;
    /** @type {Api} */ #httpApi;
    static #lang = {
        nothing_to_save: "Ingenting å lagre",
        saved_as: "Bilag bokført som nr."
    };

    set api(ref) {
        this.#pluginApi = ref;
        this.#httpApi = new Api(ref.http, err => this.#errHandler(err));
        this.#dataService = new DataService(ref.http);
        this.#session = new JournalSession(this.#dataService);
        this.#setup();
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
                this.#setup();
            }
        }
    }

    async #setup() {
        const features = [ 
            new JournalCoreFeature(),
            new JournalEntryVatFeature()
        ];
        await this.#session.initialize(features);
        this.#setupTable(this.#session.fields);
    }

    #setupTable(fields) {
        if (this.#table) return;
        this.#table = new Table();
        this.#table.setup(fields, true, this.querySelector("table"));
        this.#table.eventMap.on("change", change => {
            this.#session.setValue(change.field.name, change.value, change.rowIndex);
            if (change.rowIndex + 2 >= this.#table.count) {
                this.#table.addRows(2);
            }
            return true;
        });
        this.#clear();
    }

    #clear() {
        this.#clearMessages();
        this.#session.clear();
        this.#table.addRows(2, true);
        this.#table.focus(true);
    }

    #save() {
        this.#clearMessages();
        const saveState = this.#session.getState();
        console.log("saveState", saveState);
        if (saveState.errors.length > 0) {
            for (const err of saveState.errors) {
                this.#addMessage(err, "warn");
                console.warn(err);
            }
        } else {

            if (saveState.journals.length === 0) {
                this.#addMessage(JournalEntryEditor.#lang.nothing_to_save, "warn", 3000);
                return;
            }

            this.#httpApi.post("/api/biz/journalentries?action=book-journal-entries", saveState.journals)
                .catch( err => { console.log(err); this.#addMessage(err.error?.Message ?? err.message, "warn"); })
                .then( res => {
                    this.#clear();
                    const nrs = res.map( j => j.JournalEntryNumber).join(", ");
                    this.#addMessage(`${JournalEntryEditor.#lang.saved_as} ${nrs}`, "good", 4000);                    
                });
        }
    }

    #addMessage(msg, className, timeout) {
        const container = this.querySelector("#messages");
        if (!container) { alert("No container"); return; }
        const el = Utils.create("p", msg, "class", className);
        container.appendChild(el);
        if (timeout && timeout > 0) {
            setTimeout(() => el.remove(), timeout); //el.parentElement.remove(el), timeout);
        }
    }

    #clearMessages() {
        let container = this.querySelector("#messages");
        if (!container) return;
        container.replaceChildren();
    }

}

if (Utils.defineComponent("journal-plugin", JournalEntryEditor)) {
    Utils.addStyleSheet("journal-plugin-stylesheet", journalEntryStyles);
}
  