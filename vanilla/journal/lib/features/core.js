import { DataService } from "../../../libs/dataservice.js";
import { EventMap } from "../../../libs/editable/eventmap.js";
import { Field } from "../../../libs/editable/field.js";
import { Rows } from "../../../libs/rows.js";

export class journalRow { 
    financialDate;
    amount;
    debitAccount;
    creditAccount;
    description;
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

    /** @type { DataService} */ #dataService;
    /** @type { EventMap } */ #sessionEventMap;
    #accountCache = new Map();

    fields = [
        new Field("financialDate", "Dato", "date"),
        new Field("debitAccount", "Debet", "account"),
        new Field("creditAccount", "Kredit", "account"),
        new Field("amount", "Beløp", "money"),
        new Field("description", "Tekst", "string")
    ];

    /**
     * Initializes the feature with dataservice and dataset
     * @param {DataService} dataService - apiservice
     * @param {Rows} rows - entire journalentry dataset
     * @param {EventMap} eventMap - the sessions own eventmap
     */
    async initialize(dataService, rows, eventMap) {
        this.#dataService = dataService;
        this.#sessionEventMap = eventMap;
    }

    /**
     * Primary feature-field changes
     * @param { { name: string, value: any, rowIndex: number, rows: Rows} } change 
     */
    async onChange(change) {
        switch (change.name) {
            case "debitAccount":
            case "creditAccount":
                // Lookup account by number
                if (change.value > 0) {
                    const acc = await this.#fetchAccountByNumber(change.value, change.name);
                    if (acc) {
                        change.rows.setValue("_" + change.name, acc, change.rowIndex);
                    } else {
                        this.#sessionEventMap?.raiseEvent("error", { msg: `${change.value} not found!`, name: change.name, rowIndex: change.rowIndex });
                    }
                    return;
                }
                // Reset (clear the value)
                change.rows.setValue("_" + change.name, undefined, change.rowIndex);
                break;
        }
    }

    /**
     * Validates a row
     * @param {journalRow} row 
     * @returns { { errors: [] } | undefined }
     */
    validate(row) {
        const res = { success: false, errors: [] };
        if (row.financialDate === undefined || !(row.financialDate instanceof Date)) res.errors.push("Invalid FinancialDate");
        if (row.amount === 0) res.errors.push("Invalid Amount");
        if (!(row.debitAccount > 0 || row.creditAccount > 0)) res.errors.push("Missing DebitAccount or CreditAccount");
        res.success = res.errors.length === 0;
        return res;
    }

    /**
     * Perform any transformation of rows (if needed)
     * @param {journalRow} row
     * @param { { debitLines: [], creditLines: [], errors: [] } } result - lines and errors for this row
     */
    transform(row, result) {
        if (row.debitAccount) {
            const draftLine = new JournalEntryLineDraft(row.financialDate, row.amount, row.description);
            draftLine.AccountID = this.#mapAccountNumberToID(row.debitAccount);
            if (!draftLine.AccountID) result.errors.push(`Account ${row.debitAccount} was not found`);
            result.debitLines.push(draftLine);
        }
        if (row.creditAccount) {
            const draftLine = new JournalEntryLineDraft(row.financialDate, -row.amount, row.description);
            draftLine.AccountID = this.#mapAccountNumberToID(row.creditAccount);
            if (!draftLine.AccountID) result.errors.push(`Account ${row.creditAccount} was not found`);
            result.creditLines.push(draftLine);
        }
    }    


    #mapAccountNumberToID(accountNumber) {
        if (this.#accountCache.has(accountNumber)) {
            return this.#accountCache.get(accountNumber).ID;
        }
        return undefined;
    }

    async #fetchAccountByNumber(value) {
        if (!this.#accountCache.has(value)) {
            const fetch = await this.#dataService.get("accounts", 
                "?filter=accountnumber eq '" + value + "'"
                + "&select=ID,AccountNumber,AccountName,VatTypeID"
            );
            if (fetch?.length) {
                this.#accountCache.set(value, fetch[0]);
            } else return undefined;
        }
        return this.#accountCache.get(value);
    }    

}