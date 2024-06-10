import { Field } from "../../../libs/editable/field";

export class JournalEntryVatFeature {

    #fields = [
        new Field("DebitVatType", "Mva", "integer", "DebitAccount"),
        new Field("CreditVatType", "Mva", "integer", "CreditAccount"),
    ]

    get fields() {
        return this.#fields;
    }

}