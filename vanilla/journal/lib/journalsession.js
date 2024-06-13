import { DataService } from "../../libs/dataservice.js";
import { Field, Validation } from "../../libs/editable/field.js";
import { Rows } from "../../libs/rows.js";
import { FeatureTemplate } from "./features/template.js";

export class JournalSession {

    #settings;
    /** @type {DataService} */ #dataService;
    /** @type {Rows} */ #rows = new Rows(10000);
    /** @type {Field[]} */ #fields = [];
    /** @type {FeatureTemplate[]} */ #features = [];

    get fields() {
        return this.#fields;
    }

    get rows() {
        return this.#rows;
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
        this.#settings = await this.#dataService.first("companysettings");
        await this.#setupFeatures(features);
    }

    clear() {
        this.#rows.clear();
    }

    setValue(name, value, rowIndex) {
        this.#rows.setValue(name, value, rowIndex);
        const details = { name: name, value: value, rowIndex: rowIndex, rows: this.#rows };
        this.#features.forEach( f => f.onChange(details));
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
            const row = this.#rows.getRow(rowIndex); 
            //const row = this.#getRow(rowIndex);
            const validation = this.#validateRow(row);
            if (validation.errors.length === 0) {
                if (!this.#canAddToJournal(row, journal)) {
                    journal = { DraftLines: [] };
                    result.journals.push(journal);
                }
                // Transform
                const transform = this.#transform( row );
                if (transform.errors.length === 0)
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
     * Validates a row
     * @param {JournalRow} row 
     * @returns { { errors: [] }}
     */
    #validateRow(row) {
        const result = { errors: [] };
        this.#features.forEach( f => {
            const validate = f.validate(row);
            if (!validate) return;
            result.errors.push(... validate.errors);
        });
        return result;
    }

    /**
     * Converts a debit/credit row into one or more draftlines
     * @param {JournalRow} row 
     * @returns { lines: JournalEntryLineDraft[], errors: []}
     */
    #transform(row) {
        const result = { lines: [], errors: [] };
        const split = { debitLines: [], creditLines: [], errors: [] };
        for (const f of this.#features) 
        {
            f.transform(row, split);
            if (split.errors?.length > 0) {
                return result;
            }            
        }
        result.lines.push(...split.debitLines);
        result.lines.push(...split.creditLines);
        result.errors.push(...split.errors);
        return result;        
    }


    /**
     * Prepares a feature by importing its fields (if any)
     * @param {FeatureTemplate[]} features 
     */
    async #setupFeatures(features) {
        this.#features = features;
        for (const feature of features) {
            // initialize
            await feature.initialize(this.#dataService, this.#rows);
            // Inject fields at correct position
            feature.fields.forEach( ff => {
                if (ff.relatesTo) {
                    const index = this.#fields.findIndex( x => x.name === ff.relatesTo);
                    if (index >= 0) {
                        this.#fields.splice(index + 1, 0, ff);
                        return;
                    }
                }
                this.#fields.push(ff)
            });
        }
    }

}