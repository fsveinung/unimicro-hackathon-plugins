import { DataService } from "../../../libs/dataservice.js";
import { Field } from "../../../libs/editable/field.js";

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

export class JournalCoreFeature {

    /** @type { DataService} */ #dataService
    #accountCache = new Map();

    fields = [
        new Field("FinancialDate", "Dato", "date"),
        new Field("DebitAccount", "Debet", "account"),
        new Field("CreditAccount", "Kredit", "account"),
        new Field("Amount", "Beløp", "money"),
        new Field("Description", "Tekst", "string")
    ];

    async initialize(dataService) {
        this.#dataService = dataService;
    }

    /**
     * Event received when any field in the dataset changes
     * @param { { fieldName: string, value: any, rowIndex: number, rows: Rows} } change 
     */
    onChange(change) {
        switch (change.fieldName) {
            case "DebitAccount":
            case "CreditAccount":
                this.#lookupAccount(change.value, change.fieldName);
                break;
        }
    }

    /**
     * Validates a row
     * @param {JournalRow} row 
     * @returns { { errors: [] } | undefined }
     */
    validate(row) {
        const res = { success: false, errors: [] };
        if (row.FinancialDate === undefined || !(row.FinancialDate instanceof Date)) res.errors.push("Invalid FinancialDate");
        if (row.Amount === 0) res.errors.push("Invalid Amount");
        if (!(row.DebitAccount > 0 || row.CreditAccount > 0)) res.errors.push("Missing DebitAccount or CreditAccount");
        res.success = res.errors.length === 0;
        return res;
    }

    /**
     * 
     * @param {JournalRow} row
     * @returns { { lines: JournalEntryLineDraft[], errors: [] } | undefined } 
     */
    transform(row) {
        const result = { lines: [], errors: [] };
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

}