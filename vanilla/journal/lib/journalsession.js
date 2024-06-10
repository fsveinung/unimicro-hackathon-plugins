import { DataService } from "../../libs/dataservice.js";
import { Field, Validation } from "../../libs/editable/field.js";
import { Rows } from "../../libs/rows.js";
import { FeatureTemplate } from "./features/template.js";

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
    #accountCache = new Map();
    /** @type { FeatureTemplate[] } */ #features = [];

    get fields() {
        return this.#fields;
    }    

    constructor(dataService) {
        this.#dataService = dataService;
    }

    /**
     * Initializes the session
     * Ensures that all dependencies are fetched (settings etc.)
     * @param { FeatureTemplate } features - holds any extended features
     */
    async initialize(features) {
        this.#setupFeatures(features);
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
        if (name === "DebitAccount" || name === "CreditAccount") {
            this.#lookupAccount(value, name);
        }
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
        let journal;
        
        // Validate and transform
        for (let rowIndex = 0; rowIndex < this.#rows.length; rowIndex++) {
            // validate
            const validation = this.#validateRow(this.#getRow(rowIndex));
            if (validation.success) {
                if (!this.#canAddToJournal(validation.row, journal)) {
                    journal = { DraftLines: [] };
                    result.journals.push(journal);
                }
                // Transform
                const transform = this.#transform( validation.row );
                if (transform.success)
                    journal.DraftLines.push(... transform.lines);
                else 
                    result.errors.push(... transform.errors);
            } else {
                result.errors.push(... validation.errors);
            }
        }

        // Check balance
        for (const journal of result.journals) {
            const balance = journal.DraftLines.reduce( (sum, row) => sum += row.Amount ?? 0, 0);
            const inBalance = balance > -0.001 && balance < 0.001;
            if (!inBalance) {
                result.errors.push(`The entry does not balance. Diff: ${balance.toFixed(2)}`);
            }
        }

        return result;
    }

    /**
     * Checks if the given row can be added to the journal (checks if dates are equal)
     * @param {JournalRow} row 
     * @param {{ DraftLines: JournalEntryLineDraft[] }} journal
     * @returns {boolean} true if this row can be added to the existing journal
     */
    #canAddToJournal(row, journal) {
        if (!journal) return false;
        if (journal.DraftLines.length === 0) return true;
        if (journal.DraftLines[0].FinancialDate.getTime() === row.FinancialDate.getTime()) return true;
        return false;
    }

    /**
     * Fetches a row (ensuring it has amount, debit and creditaccounts)
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
     * @returns { success: boolean, lines: JournalEntryLineDraft[], errors: []}
     */
    #transform(row) {
        const result = { success: true, lines: [], errors: [] };
        if (row.DebitAccount) {
            const draftLine = new JournalEntryLineDraft(row.FinancialDate, row.Amount, row.Description);
            draftLine.AccountID = this.#mapAccountNumberToID(row.DebitAccount);
            if (!draftLine.AccountID) result.errors.push(`Account ${row.DebitAccount} was not found`);
            result.lines.push(draftLine);
        }
        if (row.CreditAccount) {
            const draftLine = new JournalEntryLineDraft(row.FinancialDate, -row.Amount, row.Description);
            draftLine.AccountID = this.#mapAccountNumberToID(row.CreditAccount);
            if (!draftLine.AccountID) result.errors.push(`Account ${row.CreditAccount} was not found`);
            result.lines.push(draftLine);
        }
        result.success = result.errors.length === 0;
        return result;        
    }

    #mapAccountNumberToID(accountNumber) {
        if (this.#accountCache.has(accountNumber)) {
            return this.#accountCache.get(accountNumber).ID;
        }
        return undefined;
    }

    async #lookupAccount(value) {
        if (!this.#accountCache.has(value)) {
            const fetch = await this.#dataService.get("accounts", "?filter=accountnumber eq '" + value + "'"
                + "&select=ID,AccountNumber,AccountName,VatTypeID"
            );
            if (fetch?.length) {
                this.#accountCache.set(value, fetch[0]);
            } else return undefined;
        }
        return this.#accountCache.get(value);
    }

    /**
     * Prepares a feature by importing its fields (if any)
     * @param {FeatureTemplate[]} features 
     */
    #setupFeatures(features) {
        this.#features = features;
        this.#features.forEach( f => f.fields.forEach( ff => {
            if (ff.relatesTo) {
                const index = this.#fields.findIndex( x => x.name === ff.relatesTo);
                if (index >= 0) {
                    this.#fields.splice(index + 1, 0, ff);
                    return;
                }
            }
            this.#fields.push(ff)
        }));        
    }

}