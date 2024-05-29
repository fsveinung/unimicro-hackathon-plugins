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

    addRow() {
        const row = {};
        this.#rows.push(row);
        return row;
    }

    /**
     * Tries to set a value
     * @param {string} name
     * @param {any} value 
     * @param {number} rowIndex 
     * @returns {Validation} returns a Validation object
     */
    trySetValue(name, value, rowIndex) {
        
        let res = new Validation();

        // Locate correct field
        const field = this.#fields.find( f => f.name === name);
        if (!field) return res.setMessage("Could not find field " + name); 
        
        // Validate input
        res = field.validate(value);
        if (!res.valid) return res;

        // Ensure we have prepared empty rows
        while (rowIndex > this.#rows.length - 1) {
            this.addRow();
        }

        // Locate row
        const row = this.#rows[rowIndex];

        // Set value
        row[name] = res.value;
        
        //console.table(this.#rows);
        return res
    }

}