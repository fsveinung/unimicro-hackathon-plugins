export class Rows {

    #upperLimit = 100;
    #rows = [];

    constructor(upperLimit) {
        this.#upperLimit = Number.isInteger(upperLimit) ? upperLimit : this.#upperLimit;
    }

    clear() {
        this.#rows = [];
    }

    removeRow(rowIndex) {
        if (rowIndex < this.#rows.length) {
            this.#rows.splice(rowIndex, 1);
        }
    }

    addRow() {
        return this.getRow(this.#rows.length);
    }

    setValue(name, value, rowIndex) {
        if (!this.#isValidRowIndex(rowIndex)) return;
        const row = this.getRow(rowIndex);
        row[name] = value;
        return row;
    }

    #isValidRowIndex(rowIndex) {
        if (!Number.isInteger(rowIndex)) return false;
        if (rowIndex < 0) return false;
        if (rowIndex > this.#upperLimit ?? 100000) return false;
        return true;
    }

    getRow(rowIndex) {
        if (!this.#isValidRowIndex(rowIndex)) return;
        while (this.#rows.length <= rowIndex) this.#rows.push({});
        return this.#rows[rowIndex];
    }

    sum(fieldName) {
        return this.#rows.reduce( (sum, row) => sum += row[fieldName] ?? 0, 0);
    }
}