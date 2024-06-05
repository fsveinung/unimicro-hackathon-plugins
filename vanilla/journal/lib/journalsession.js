import { DataService } from "../../libs/dataservice.js";
import { Field, Validation } from "../../libs/editable/field.js";
import { Rows } from "../../libs/rows.js";

export class JournalSession {

    /** @type {DataService} */ #dataService;
    #settings;
    #vatTypes;
    /** @type {Rows} */ #rows = new Rows(10000);
    /** @type {Field[]} */ #fields = [
        new Field("FinancialDate", "Dato", "date"),
        new Field("DebitAccount", "Debet", "account"),
        new Field("CreditAccount", "Kredit", "account"),
        new Field("Amount", "Beløp", "money"),
        new Field("Description", "Tekst", "string")
    ];

    get fields() {
        return this.#fields;
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

    clear() {
        this.#rows.clear();
    }

    setValue(name, value, rowIndex) {
        this.#rows.setValue(name, value, rowIndex);
    }

    addRow() {
        return this.#rows.addRow();
    }

    /**
     * Returns an array of journalentries which all contain an array of DraftLines
     * @returns { { Journals: [ DraftLines: [], Errors: [] } ] }
     */
    getState() {
        const result = { Journals: [], Errors: [] };
        let journal = { DraftLines: [] };
        result.Journals.push(journal);
        
        for (let rowIndex = 0; rowIndex < this.#rows.length; rowIndex++) {
            let rowDate = this.#rows.getValue("FinancialDate", rowIndex, "");
            let rowAmount = this.#rows.getValue("Amount", rowIndex, 0);
            let rowDebit = this.#rows.getValue("DebitAccount", rowIndex, 0);
            let rowCredit = this.#rows.getValue("CreditAccount", rowIndex, 0);
            const validDate = rowDate instanceof Date;
            const validRow = validDate && rowAmount !== 0 && (rowDebit > 0 || rowCredit > 0);
            if (!validRow) {

            }
        }
    }

}