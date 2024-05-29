import { Dates } from "../dates.js";

export class Field {

    /** @type {string} */ name;
    /** @type {string} */ label;
    /** @type {"string"|"date"|"money"|"integer"|"account"} */ type;

    constructor(name, label, type) {
        this.name = name;
        this.label = label;
        this.type = type;
    }

    /**
     * Validates the input
     * @param {any} input 
     * @returns {Validation}
     */
    validate(input) {
        const res = new Validation().setValue(input);
        switch (this.type) {
            case "date":
                return this.#checkDate(res);
        }
        return res;
    }

    #checkDate(res) {
        const dt = Dates.parseDate(res.value);
        if (dt) {
            return res.setValue(dt, dt.toLocaleDateString(undefined, { year: "numeric", month: "2-digit", day: "2-digit" }) );
        }
        return res.setMessage("Invalid date");
    }


}

export class Validation {
    valid = false;
    message;
    value;
    textValue;

    setMessage(msg) {
        this.message = msg;
        this.valid = false;
        return this;
    }

    setValue(value, textValue) {
        this.value = value;
        this.textValue = textValue ?? ("" + value);
        this.valid = true;
        return this;
    }
}