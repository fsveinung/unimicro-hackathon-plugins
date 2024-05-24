import { Editable } from "./editable.js";
import { Field } from "./field.js";
import { Utils } from "../utils.js";
import { css } from "./table.css";

export class Table {

    /** @type {HTMLTableElement} */ #table;
    /** @type {Map<string, Field>} */ #columns;
    /** @type {Editable} */ #editable;
    /** @type {Map<string, CallableFunction>} */ #eventMap = new Map();

    /**
     * Set focus on table if it is editable
     * @param {bool} startEdit - true to start editing directly
     */
    focus(startEdit) {
        if (this.#editable) {
            this.#editable.focus(startEdit);
        }
    }

    /**
     * Set callback-function to handle changes
     * @param {requestCallback(change: { colName: string, rowIndex: number, value: string, commit: boolean })} callBack 
     */
    onChange(callBack) {
        this.#eventMap.set("change", callBack);
    }
    
    /**
     * Sets up the table
     * @param {Map<string, Field>} columns - map of fields in the layout of the table
     * @param {bool} editable - true if the table should be editable
     * @param {HTMLTableElement | undefined} table - optioanl existing Htmltable dom-element
     * @returns {HTMLTableElement} - the html-table element
     */
    setup(columns, editable, table) {

        if (!table) {
            table = document.createElement("table");
        }

        table.classList.add("editable");
        Utils.addStyleSheet("editable", css);

        this.#table = table;
        this.#columns = columns;

        if (editable) {
            this.#editable = new Editable();
            this.#editable.init(table, columns);
            this.#editable.onChange(change => this.#fireCallBack("change", change) );
        }

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

        return table;
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

    /**
     * Will try to call given callback if registered
     * @param {string} name - eventname
     * @param {any} cargo - event-parameter
     * @returns {true | false}
     */
    #fireCallBack(name, cargo) {
        if (this.#eventMap.has(name)) {
            const handler = this.#eventMap.get(name);
            return handler(cargo);
        }
        return true;
    }    
}