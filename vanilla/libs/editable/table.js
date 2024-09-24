import { Editable } from "./editable.js";
import { Field } from "./field.js";
import { Utils } from "../utils.js";
import { css } from "./table.css";
import { EventMap } from "./eventmap.js";
import { Rows } from "../rows.js";

export class Table {

    eventMap = new EventMap();
    /** @type {HTMLTableElement} */ #table;
    /** @type {Field[]} */ #fields;
    /** @type {Editable} */ #editable;    

    /**
     * Set focus on table if it is editable
     * @param {bool} startEdit - true to start editing directly
     */
    focus(startEdit) {
        if (this.#editable) {
            this.#editable.focus(startEdit);
        }
    }

    get count() {
        return (this.#table?.rows?.length ?? 1) - 1; // minus-1 because of header
    }
    
    /**
     * Sets up the table
     * @param {Field[]} fields - map of fields in the layout of the table
     * @param {bool} editable - true if the table should be editable
     * @param {HTMLTableElement | undefined} table - optional existing Htmltable dom-element
     * @param {Rows | undefined} rows - relation to actual rows dataset for listening to changes
     * @returns {HTMLTableElement} - the html-table element (optional)
     */
    setup(fields, editable, table, rows) {

        if (!table) {
            table = document.createElement("table");
        }

        table.classList.add("editable");
        Utils.addStyleSheet("editable", css);

        this.#table = table;
        this.#fields = fields;

        if (editable) {
            this.#editable = new Editable();
            this.#editable.init(table, fields);
            this.#editable.eventMap.on("change", change => this.eventMap.raiseEvent("change", change) );
            this.#editable.eventMap.on("startEdit", evt => this.eventMap.raiseEvent("startEdit", evt) );
        }

        let thead = table.querySelector("thead");
        if (!thead) {
            thead = Utils.create("thead");
            table.appendChild(thead);
        } else {
            thead.querySelectorAll("*").forEach(n => n.remove());
        }

        const tr = Utils.create("tr");
        for (const fld of fields) {
            const td = Utils.create("th", fld.label, "class", fld.type);
            tr.appendChild(td);
        }
        thead.appendChild(tr);

        // Listen for changes updated by features or other handlers
        rows?.eventMap.on("change", change => this.#handleExternalUpdates(change) );

        return table;
    }

    /**
     * Adds a number of empty rows to the table
     * @param {number} count - number of rows to add
     * @param {boolean | undefined} clear - optional parameter that clears the table rows first
     */
    addRows(count, clear) {
        const table = this.#table;
        if (!table) { console.log("No table?");  return; }
        let tBody = table.querySelector("tbody");
        if (!tBody) {
            tBody = Utils.create("tbody");
            table.appendChild(tBody);
        }

        if (!!clear) {
            this.#editable?.clear();
            tBody.replaceChildren();
        }

        for (let i = 0; i < (count || 1); i++) {
            const tr = Utils.create("tr");
            for (const col of this.#fields) {
                const td = Utils.create("td", "", "class", col.type);
                tr.appendChild(td);
            }        
            tBody.append(tr);
        }
    }

    /**
     * Highlights a cell by setting av class on it
     * @param {string} name - name of field
     * @param {number} rowIndex - which row
     * @param {string} className - classname to set to the cell
     * @param {boolean} add - set to true if class should be added
     * @param {number | undefined} tiemout - timeout for when class should be removed
     */
    cellClass(name, rowIndex, className, add, timeout) {  
        const cell = this.#getCell(name, rowIndex);
        if (cell) {
            if (add) {
                cell.classList.add(className);
                if (timeout && timeout > 0) {
                    setTimeout(() => { cell.classList.remove(className); }, timeout);
                }
            } else {
                cell.classList.remove(className);
            }
        }
    }

    /**
     * Tries to fetch a specific table cell
     * @param {string} name 
     * @param {number} rowIndex 
     * @returns { HTMLTableCellElement | undefined}
     */
    #getCell(name, rowIndex) {
        const fld = this.#fields.find( f => f.name === name);
        if (!fld) return;
        const cellIndex = this.#fields.indexOf(fld);
        if (this.#table.rows.length > rowIndex + 1) {
            const row = this.#table.rows[rowIndex+1];
            return row.cells[cellIndex];
        }        
    }

    /**
     * Handle external value-changes
     * @param {{name: string, value: any, rowIndex: number}} change 
     */
    #handleExternalUpdates(change) {
        // console.log("table changes: " + change.name, change);
        const cell = this.#getCell(change.name, change.rowIndex);
        if (cell) {
            cell.innerText = change.value;
        }
    }

   
}