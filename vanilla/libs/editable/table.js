import { Editable } from "./editable.js";

export class Table {

    #table;
    #columns;

    /** @type {Editable} */
    #editable;

    /**
     * Set focus on table if it is editable
     * @param {bool} startEdit - true to trigger editor
     */
    focus(startEdit) {
        if (this.#editable) {
            this.#editable.focus(startEdit);
        }
    }
    
    /**
     * Sets up the table
     * @param {HTMLTableElement} table - the Htmltable dom-element
     * @param {Map<string, {name: string, label: string, type: string}>} columns - map of fields in the layout of the table
     * @param {bool} editable - true if the table should be editable
     */
    setup(table, columns, editable) {

        if (editable) {
            this.#editable = new Editable();
            this.#editable.init(table, columns);
        }

        this.#table = table;
        this.#columns = columns;
        if (!table) return;
        let thead = table.querySelector("thead");
        if (!thead) {
            thead = Utils.create("thead");
            table.appendChild(thead);
        } else {
            thead.querySelectorAll("*").forEach(n => n.remove());
        }
        const tr = Utils.create("tr");
        for (const [key, col] of columns) {
            const td = Utils.create("th", col.label, "class", col.type);
            tr.appendChild(td);
        }
        thead.appendChild(tr);
    }

    /**
     * Adds a number of empty rows to the table
     * @param {number} count - number of rows to add
     */
    addRows(count) {
        const map = this.#columns;
        const table = this.#table;
        if (!table) { console.log("No table?");  return; }
        let tBody = table.querySelector("tbody");
        if (!tBody) {
            tBody = Utils.create("tbody");
            table.appendChild(tBody);
        }
        for (let i = 0; i < (count || 1); i++) {
            //const row = this._session.addRow();
            const tr = Utils.create("tr");
            for (const [key, col] of map) {
                const td = Utils.create("td", "", "class", col.type);
                tr.appendChild(td);
            }        
            tBody.append(tr);
        }
    }    
}