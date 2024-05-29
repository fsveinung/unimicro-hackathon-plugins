import { DataService } from "../../libs/dataservice.js";
import { Field, Validation } from "../../libs/editable/field.js";

export class JournalSession {

    #dataService;
    #settings;
    #vatTypes;
    #rows = [];
    #fields = [
        new Field("FinancialDate", "Dato", "date"),
        new Field("DebitAccount", "Debet", "account"),
        new Field("CreditAccount", "Kredit", "account"),
        new Field("Amount", "Beløp", "money"),
        new Field("Description", "Tekst", "string")
    ];

    get rows() {
        return this.#rows;
    }

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


    setValue(name, value, rowIndex) {
        const row = this.#getRowAt(rowIndex);
        row[name] = value;
    }

    addRow() {
        const row = {};
        this.#rows.push(row);
        return row;
    }

    #getRowAt(rowIndex) {
        while (rowIndex > this.#rows.length - 1) {
            this.addRow();
        }
        return this.#rows[rowIndex];
    }


}