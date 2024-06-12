import { Field } from "../../../libs/editable/field.js";
import { Rows } from "../../../libs/rows.js";

export class JournalEntryVatFeature {

    /** @type { any[] } */
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
        rows.eventMap.on("change", 
            change => this.#onDataSetChange({ name: change.name, value: change.value, rowIndex: change.rowIndex, rows: rows })
        );
    }

    /**
     * Direct feature-field changes
     * @param { { name: string, value: any, rowIndex: number, rows: Rows} } change 
     */
    onChange(change) {

        
    }

    /**
     * Secondary dataset-changes
     * @param { { name: string, value: any, rowIndex: number, rows: Rows} } change 
     */    
    #onDataSetChange(change) {
        switch (change.name) {
            case "_DebitAccount":
                const dt = this.#vatTypes.find( t => t.ID == change.value.VatTypeID );
                if (dt) change.rows.setValue("DebitVatType", dt.VatCode, change.rowIndex);
                break;
            case "_CreditAccount":
                const ct = this.#vatTypes.find( t => t.ID == change.value.VatTypeID );
                if (ct) change.rows.setValue("CreditVatType", ct.VatCode, change.rowIndex);
                break;                
        }
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