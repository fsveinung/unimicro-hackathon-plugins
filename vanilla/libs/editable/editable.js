import { CellEditor } from "./celleditor.js";
import { CellPosition, TableNavigation } from "./keys.js";
import { Field } from "./field.js";
import { EventMap } from "./eventmap.js";

export class Editable {

    eventMap = new EventMap();
    #tableNode;
    /** @type {Field[]} */ #fields;
    #current = {
        cell: undefined,
        editor: undefined,
        isEditing: false,
        field: undefined
    };

    
    init(tableNode, fields) {
        this.#tableNode = tableNode;
        this.#fields = fields;
        this.#tableNode.addEventListener("click", evt => this.#onCellClick(evt));        
        this.#tableNode.addEventListener("dblclick", evt => this.#onCellDblClick(evt));
        this.#tableNode.addEventListener("keydown", evt => this.#keyDown(evt));
        this.#tableNode.addEventListener("resize", evt => this.#onResize(evt));
    }

    clear() {
        this.#current.cell = undefined;
    }

    focus(startEdit) {
        this.#onCellClick(undefined, startEdit);
    }

    #onCellDblClick(event) {
        this.#onCellClick(event, true);
    }

    #onCellClick(event, startEdit) {
        let cell = this.#current.cell;

        // Event trigger?
        if (event && event.target) {
            cell = event.target;
            if (cell.nodeName !== "TD") return;
        }

        if (!cell) {
            cell = this.#getCellAt(0 , 1);
        }

        if (this.#current.isEditing) {
            this.#current.editor.stopEdit(true, this.#getCellPosition(cell) );
            return;
        }

        this.#focusCell(cell, startEdit);

    }

    #focusCell(cell, startEdit) {
        
        //console.log(`#focusCell(${typeof cell}, startEdit = ${!!startEdit})`);
        if (!cell.getAttribute("tabindex")) {
            cell.setAttribute("tabindex", this.#calcCellIndex(cell));
        }
        cell.focus();
        this.#current.cell = cell;
        if (startEdit) {
            //console.log("Trying to open editor");
            this.#openEditor();
        }
    }

    #keyDown(evt) {
        const cell = this.#current.cell;

        const nav = TableNavigation.detectNavigation(cell, evt);
        if (nav) {
            const target = this.#getCellAt(nav.col, nav.row);
            if (target) {
                this.#focusCell(target);
            }
            evt.preventDefault();
            return;            
        }

        if (this.#isTyping(evt)) {
            this.#openEditor();
        }

    }

    #isTyping(evt) {
        //console.log(`isTyping(key:${evt.key}, code:${evt.code}, keyCode:${evt.keyCode})`);
        if (!(evt && evt.code && evt.key)) return false;
        const isRegularKey = (evt.code === `Key${evt.key.toUpperCase()}`);
        if (isRegularKey) return true;
        if (evt.key === "Tab" || evt.key === "Shift" || evt.key === "Control") 
            return false;
        // todo: check for virtual keys to ignore
        if (evt.key === "Delete") return false;
        return true; 
    }

    #openEditor() {
        //console.log("StartEdit code: " + key);
        if (!this.#current.editor) {
            this.#current.editor = new CellEditor();
            this.#current.editor.create(this.#tableNode);
            this.#current.editor.eventMap.on("keydown", e => this.#handleEditEvents(e));
            this.#current.editor.eventMap.on("close", e => this.#handleEditClosing(e));
        }

        const def = this.#getCellDef(this.#current.cell);
        
        if (def && def.readOnly) {
            return;
        }
        
        // Launch StartEdit event
        const pos = this.#getCellPosition(this.#current.cell);
        const eventCargo = { field: def, rowIndex: pos.row - 1, allow: true };
        this.eventMap.raiseEvent("startEdit", eventCargo);
        if (!eventCargo.allow) 
            return;

        const cell = this.#current.cell;
        const text = cell.innerText ?? "";
        this.#current.isEditing = true;
        this.#current.editor.startEdit(text, cell);
        
    }

    #handleEditEvents(event) {
        //console.log("handleEditEvents", event);
    }

    /**
     * Handler for when editor is closing
     * @param {{cell: HTMLTableCellElement, text: string, commit: boolean, nav: CellPosition}} event 
     */
    #handleEditClosing(event) {  
        //console.log("handleEditClosing", event);
        this.#current.isEditing = false;
        let cell = event.cell ?? this.#current.cell;

        if (event.commit) {
            this.#tryCommitUserInput(cell, event.text);
        }

        if (event.nav) {
            const nextCell = this.#getCellAt(event.nav.col, event.nav.row);
            if (nextCell) {
                cell = nextCell;
            }
        }        
        this.#focusCell(cell);
    }

    #tryCommitUserInput(cell, text) {
        let update = true;
        const pos = this.#getCellPosition(cell);
        const fld = this.#getCellDef(cell);
        if (fld) {            
            const chk = fld.validate(text);
            if (!chk.valid) {
                return false;
            }

            const cargo = { field: fld, rowIndex: pos.row - 1, value: chk.value, commit: true };
            update = this.eventMap.raiseEvent("change", cargo);
            if (update === false || cargo.commit === false ) {
                update = false;
            } else {
                update = true;
                text = chk.textValue;
            }
        }
        if (update) {
            cell.innerText = text;
            return true;
        }
        return false;
    }

    #getCellAt(colIndex, rowIndex) {
        const table = this.#tableNode;        
        if (!table) return;
        if (table.rows.length < rowIndex) return;
        const row = rowIndex > 0 
            ? table.rows[rowIndex]
            : table.rows[table.rows.length - 1];
        if (colIndex < 0) return row.cells[0];
        if (row.cells.length < colIndex) {
            return row.cells[row.cells.length - 1];
        }
        return row.cells[colIndex];
    }

    #calcCellIndex(cell) {
        const pos = this.#getCellPosition(cell);
        return ((pos.row * 50) + pos.col) + 1000;
    }

    /**
     * Returns the col and  row indexes of the given cell.
     * @param {HTMLTableCellElement} cell 
     * @returns {{ row: number, col: number }}
     */
    #getCellPosition(cell) {
        return {
            row: cell.parentElement.rowIndex,
            col: cell.cellIndex
        };
    }    

    /**
     * Returns the current field-definition of the given table-cell
     * @param {HTMLTableCellElement} cell 
     * @returns Field
     */
    #getCellDef(cell) {
        if (!this.#fields) return undefined;
        let fld = this.#fields[cell.cellIndex];
        if (!fld.validate) { 
            fld = new Field(fld.name, fld.label, fld.type, fld.relatesTo, fld.readOnly)
        };
        return fld;
    }

    #onResize() {

    }


}