import { Field } from "../../../libs/editable/field.js";
import { Rows } from "../../../libs/rows.js";

export class JournalEntryVatFeature {

    #vatTypes;

    fields = [
        new Field("DebitVatType", "Mva", "integer", "DebitAccount"),
        new Field("CreditVatType", "Mva", "integer", "CreditAccount"),
    ]

    /**
     * Initializes the feature with dataservice and dataset
     * @param {DataService} dataService 
     * @param {Rows} rows 
     */
    async initialize(dataService, rows) {
        this.#vatTypes = await dataService.getAll("vattypes");
        rows.eventMap.on("change", change => console.log("change", change));
        //console.table(this.#vatTypes);
    }

    /**
     * Event received when any field in the dataset changes
     * @param { { fieldName: string, value: any, rowIndex: number, rows: Rows} } details 
     */
    onChange(details) {
        // todo: react on account-change and fetch/set its vattype
    }

    /**
     * Validates a row
     * @param {JournalRow} row 
     * @returns { { errors: [] } | undefined }
     */
    validate(row) {    

    }

    /**
     * Perform any transformation of rows (if needed)
     * @param {JournalRow} row
     * @returns { { lines: JournalEntryLineDraft[], errors: [] } | undefined } 
     */
    transform(row) {

    }  

}