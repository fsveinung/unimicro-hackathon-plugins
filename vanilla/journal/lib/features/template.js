import { DataService } from "../../../libs/dataservice.js";
import { Rows } from "../../../libs/rows.js";
import { JournalRow } from "../journalsession.js";

export class FeatureTemplate {
    
    /** @type { Field[] } */ fields;

    /**
     * Initializes the feature with dataservice and dataset
     * @param {DataService} dataService 
     * @param {Rows} rows 
     */
    async initialize(dataService, rows) {

    }

    /**
     * Event received when any field in the dataset changes
     * @param { { name: string, value: any, rowIndex: number, rows: Rows} } details 
     */
    onChange(details) {

    }

    /**
     * Validates a row
     * @param {JournalRow} row 
     * @returns { { errors: [] } | undefined }
     */
    validate(row) {    

    }

    /**
     * 
     * @param {JournalRow} row
     * @returns { { lines: JournalEntryLineDraft[], errors: [] } | undefined } 
     */
    transform(row) {

    }

}