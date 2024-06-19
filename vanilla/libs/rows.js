import { EventMap } from "./editable/eventmap.js";

export class Rows {

    #upperLimit = 100;
    #rows = [];
    eventMap = new EventMap();

    constructor(upperLimit) {
        this.#upperLimit = Number.isInteger(upperLimit) ? upperLimit : this.#upperLimit;
    }

    get length() {
        return this.#rows.length;
    }

    clear() {
        this.#rows = [];
        this.eventMap.raiseEvent("clear");
    }

    removeRow(rowIndex) {
        if (rowIndex < this.#rows.length) {
            this.eventMap.raiseEvent("removeRow", rowIndex);
            this.#rows.splice(rowIndex, 1);
        }
    }

    addRow() {
        return this.getRow(this.#rows.length);
    }

    /**
     * Sets a value in the matrix based on name and rowindex
     * @param {string} name 
     * @param {any} value 
     * @param {number} rowIndex 
     * @param {bool | undefined} cascade - should this cascade new events
     * @returns { any | undefined } - the row where the value is stored
     */
    setValue(name, value, rowIndex, cascade) {
        if (!this.#isValidRowIndex(rowIndex)) return;
        const row = this.getRow(rowIndex);
        row[name] = value;
        if (cascade === undefined || !!cascade) {
            this.eventMap.raiseEvent("change", { name: name, value: value, rowIndex: rowIndex });
        }
        return row;
    }

    /**
     * Fetch value from the matrix
     * @param {string} propertyname 
     * @param {number} rowIndex 
     * @param {any} defaultValue - return this if property does not exist
     * @returns 
     */
    getValue(name, rowIndex, defaultValue) {
        if (!this.#isValidRowIndex(rowIndex)) return defaultValue;
        const row = this.getRow(rowIndex);
        return row[name] ?? defaultValue;
    }

    getRow(rowIndex) {
        if (!this.#isValidRowIndex(rowIndex)) return;
        while (this.#rows.length <= rowIndex) this.#rows.push({});
        return this.#rows[rowIndex];
    }

    sum(name) {
        return this.#rows.reduce( (sum, row) => sum += row[name] ?? 0, 0);
    }

    groupBy(property) {
        Object.groupBy(this.#rows, row => row[property]);
    }

    #isValidRowIndex(rowIndex) {
        if (!Number.isInteger(rowIndex)) return false;
        if (rowIndex < 0) return false;
        if (rowIndex > this.#upperLimit ?? 100000) return false;
        return true;
    }    
}