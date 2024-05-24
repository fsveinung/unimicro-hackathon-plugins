export class Field {

    /** @type {string} */ name;
    /** @type {string} */ label;
    /** @type {"string"|"date"|"money"|"integer"|"account"} */ type;

    constructor(name, label, type) {
        this.name = name;
        this.label = label;
        this.type = type;
    }

}