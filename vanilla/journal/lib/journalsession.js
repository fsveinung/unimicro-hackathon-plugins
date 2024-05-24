import { DataService } from "../../libs/dataservice.js";
import { Field } from "../../libs/editable/field.js";

export class JournalSession {

    #dataService;
    #settings;
    #vatTypes;
    #rows = [];
    /** @type {Map<string, Field>} */ #columns = new Map();

    get rows() {
        return this.#rows;
    }

    get columns() {
        if (this.#columns.size === 0) this.#columns = this.setupColumns();
        return this.#columns;
    }    

    constructor(dataService) {
        this.#dataService = dataService;
    }

    /**
     * Initializes the session
     * Ensures that all dependencies are fetched (settings etc.)
     */
    async initialize() {
        this.#settings = await this.#dataService.first("companysettings");
        console.log(this.#settings);
        // this._accounts = await this._dataService.getAll("accounts?filter=toplevelaccountgroupid gt 0 and isnull(visible,0) eq 1");
        // console.table(this._accounts);
        this.#vatTypes = await this.#dataService.getAll("vattypes");
        //console.table(this._vatTypes);
    }

    setupColumns() {
        const map = new Map();
        map.set("FinancialDate", { name: "FinancialDate", label: "Dato", type: "date" });
        map.set("DebitAccount", { name: "DebitAccount", label: "Debet", type: "account" });
        map.set("CreditAccount", { name: "CreditAccount", label: "Kredit", type: "account" });
        map.set("Amount", { name: "Amount", label: "Beløp", type: "money" });
        map.set("Description", { name: "Description", label: "Tekst", type: "string" });
        return map;
    }

    addRow() {
        const row = {};
        this.#rows.push(row);
        return row;
    }

}