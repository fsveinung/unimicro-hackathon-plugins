import { Field } from "../../../libs/editable/field";

export class JournalEntryVatFeature {

    #vatTypes;

    fields = [
        new Field("DebitVatType", "Mva", "integer", "DebitAccount"),
        new Field("CreditVatType", "Mva", "integer", "CreditAccount"),
    ]

    async initialize(dataService) {
        this.#vatTypes = await dataService.getAll("vattypes");
        console.table(this.#vatTypes);
    }    

}