import { Field } from "../../../libs/editable/field.js";
import { Rows } from "../../../libs/rows.js";
import { journalRow } from "./core.js";

export class JournalEntryVatFeature {

    /** @type { any[] } */
    #vatTypes;

    fields = [
        new Field("debitVatType", "Mva", "integer", "debitAccount"),
        new Field("creditVatType", "Mva", "integer", "creditAccount"),
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
     * Primary feature-field changes
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
            case "_debitAccount":
                const dt = this.#vatTypes.find( t => t.ID == change.value.VatTypeID );
                if (!dt) break;
                change.rows.setValue("debitVatType", dt.VatCode, change.rowIndex);
                change.rows.setValue("_debitVatType", dt, change.rowIndex);
                break;
            case "_creditAccount":
                const ct = this.#vatTypes.find( t => t.ID == change.value.VatTypeID );
                if (!ct) break;
                change.rows.setValue("creditVatType", ct.VatCode, change.rowIndex);
                change.rows.setValue("_creditVatType", ct, change.rowIndex);
                break;                
        }
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
        if (row._debitVatType) {
            result.debitLines.forEach( l => l.VatTypeID = row._debitVatType.ID);
        }
        if (row._creditVatType) {
            result.creditLines.forEach( l => l.VatTypeID = row._creditVatType.ID);
        }
    }  

}