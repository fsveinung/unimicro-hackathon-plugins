import { DataService } from "../../libs/dataservice.js";
import { Field, Validation } from "../../libs/editable/field.js";
import { Rows } from "../../libs/rows.js";

export class JournalRow { 
    FinancialDate;
    Amount;
    DebitAccount;
    CreditAccount;
    Description;
}

export class JournalEntryLineDraft {
    FinancialDate;
    Amount;
    AccountID;
    Description;
    constructor(date, amount, description) {
        this.FinancialDate = date;
        this.Amount = amount;
        this.Description = description;
    }
}

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
     * Returns an array of journals which all contain an array of DraftLines
     * @returns { { journals: [ { DraftLines: [] } ], errors: [] }
     */
    getState() {
        const result = { journals: [], errors: [] };
        let journal = { DraftLines: [] };
        result.journals.push(journal);
        
        for (let rowIndex = 0; rowIndex < this.#rows.length; rowIndex++) {
            const validation = this.#validateRow(this.#getRow(rowIndex));
            if (validation.success) {
                const newJournal = rowIndex > 0 
                    && journal.DraftLines[journal.DraftLines.length-1].FinancialDate !== validation.row.FinancialDate;
                if (newJournal) {
                    journal = { DraftLines: [] };
                    result.journals.push(journal);
                }
                journal.DraftLines.push(... this.#transform( validation.row ));
            } else {
                result.errors.push(... validation.errors);
            }
        }

        return result;
    }

    /**
     * Fetches a row
     * @param {number} rowIndex 
     * @returns {JournalRow};
     */
    #getRow(rowIndex) {
        const row = this.#rows.getRow(rowIndex);
        row.Amount = row.Amount ?? 0;
        row.DebetAccount = row.DebetAccount ?? 0;
        row.CreditAccount = row.CreditAccount ?? 0;
        row.Description = row.Description ?? "";
        return row;
    }

    /**
     * Validates a row
     * @param {JournalRow} row 
     * @returns { { success: boolean, row: JournalRow, errors: [] }}
     */
    #validateRow(row) {
        const res = { success: false, row: row, errors: [] };
        if (!row.FinancialDate instanceof Date) res.errors.push("Invalid FinancialDate");
        if (row.Amount === 0) res.errors.push("Invalid Amount");
        if (!(row.DebitAccount > 0 || row.CreditAccount > 0)) res.errors.push("Missing DebitAccount or CreditAccount");
        res.success = res.errors.length === 0;
        return res;
    }

    /**
     * Converts a debit/credit row into one or more draftlines
     * @param {JournalRow} row 
     * @returns {JournalEntryLineDraft[]}
     */
    #transform(row) {
        const result = [];
        if (row.DebitAccount) {
            const draftLine = new JournalEntryLineDraft(row.FinancialDate, row.Amount, row.Description);
            draftLine.AccountID = row.DebitAccount; // todo: lookup actual accountid
            result.push(draftLine);
        }
        if (row.CreditAccount) {
            const draftLine = new JournalEntryLineDraft(row.FinancialDate, -row.Amount, row.Description);
            draftLine.AccountID = row.CreditAccount; // todo: lookup actual accountid
            result.push(draftLine);
        }
        return result;        
    }

}