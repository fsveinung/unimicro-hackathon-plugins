import { Dates } from "../dates.js";

export class Field {

    /** @type {string} */ name;
    /** @type {string} */ label;
    /** @type {"string"|"date"|"money"|"integer"|"account"|"largesum"} */ type;
    /** @type {string} */ relatesTo;
    /** @type {boolean|undefined} */ readOnly;

    constructor(name, label, type, relatesTo, readOnly) {
        this.name = name;
        this.label = label;
        this.type = type;
        if (!!relatesTo) this.relatesTo = relatesTo;
        this.readOnly = !!readOnly;
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
            case "integer":
            case "account":
                return this.#checkInteger(res);
            case "money":
            case "decimal":
                return this.#checkDecimal(res);

            case "largesum":
                if (res.textValue?.includes('k')) res.value = res.textValue.replaceAll('k', '000');
                if (res.textValue?.includes('m')) res.value = res.textValue.replaceAll('m', '000000');
                return this.#checkDecimal(res, 0);
        }
        return res;
    }

    /**
     * Validates input as a date
     * @param {Validation} res - the value being checked
     * @returns {Validation} updated validation
     */
    #checkDate(res) {
        const dt = Dates.parseDate(res.value);
        if (dt) {
            return res.setValue(dt, dt.toLocaleDateString(undefined, { year: "numeric", month: "2-digit", day: "2-digit" }) );
        }
        return res.setMessage("Invalid date");
    }

    /**
     * Validates input as an integer
     * @param {Validation} res - the value being checked
     * @returns {Validation} updated validation
     */
    #checkInteger(res) {
        if (Number.isInteger(res.value)) return res.setValue(res.value);
        const iValue = parseInt(res.value);
        if (isNaN(res.value)) return res.setMessage("Not a number");
        return res.setValue(iValue);
    }

    /**
     * Validates input as a decimal
     * @param {Validation} res - the value being checked
     * @returns {Validation} updated validation
     */
    #checkDecimal(res, digits) {
        digits ??= 2;
        if(typeof res.value == 'number' && !isNaN(res.value)){
            return res.setValue(res.value, res.value.toFixed(digits));
        } else {
            const dec = parseFloat(("" + res.value).replaceAll(",", "."));
            if (!isNaN(dec)) {
                return res.setValue(dec, dec.toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits }));
            }
        }    
        return res.setMessage("Invalid decimal");    
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