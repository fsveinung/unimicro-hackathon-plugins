import { DataService } from "../../../libs/dataservice.js";
import { Rows } from "../../../libs/rows.js";
import { JournalRow as journalRow } from "../journalsession.js";

export class FeatureTemplate {
    
    /** @type { Field[] } */ fields;

    /**
     * Initializes the feature with dataservice and dataset
     * @param {DataService} dataService - apiservice
     * @param {Rows} rows - entire journalentry dataset
     */
    async initialize(dataService, rows) {

    }

    /**
     * Primary feature-field changes
     * @param { { name: string, value: any, rowIndex: number, rows: Rows} } change 
     */
    onChange(details) {

    }

    /**
     * Validates a row
     * @param {journalRow} row 
     * @returns { { errors: [] } | undefined }
     */
    validate(row) {    

    }

    /**
     * Perform any transformation of rows (if needed)
     * @param {journalRow} row
     * @param { { debitLines: [], creditLines: [], errors: [] } } result - lines and errors for this row
     */
    transform(row, result) {

    }

}