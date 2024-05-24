import { CellEditor } from "./celleditor.js";
import { CellPosition, TableNavigation } from "./keys.js";

export class Editable {
    
    _tableNode;
    _columns;
    _current = {
        cell: undefined,
        editor: undefined,
        isEditing: false
    };

    
    init(tableNode, colMap) {
        this._tableNode = tableNode;
        this._columns = colMap;
        this._tableNode.addEventListener("click", evt => this.#onCellClick(evt));        
        this._tableNode.addEventListener("dblclick", evt => this.#onCellDblClick(evt));
        this._tableNode.addEventListener("keydown", evt => this.#keyDown(evt));
        this._tableNode.addEventListener("resize", evt => this.#onResize(evt));
    }

    focus() {
        this.#onCellClick();
    }

    #onCellDblClick(event) {
        this.#onCellClick(event, true);
    }

    #onCellClick(event, startEdit) {
        let cell = this._current.cell;

        // Event trigger?
        if (event && event.target) {
            cell = event.target;
            if (cell.nodeName !== "TD") return;
        }

        if (!cell) {
            cell = this.#getCellAt(0 , 1);
        }

        if (this._current.isEditing) {
            this._current.editor.stopEdit(true, this.#getCellPosition(cell) );
            return;
        }

        this.#focusCell(cell, startEdit);

    }

    #focusCell(cell, startEdit) {
        if (!cell.getAttribute("tabindex")) {
            cell.setAttribute("tabindex", this.#calcCellIndex(cell));
        }
        cell.focus();
        this._current.cell = cell;
        if (startEdit) {
            this.#openEditor();
        }
    }

    #keyDown(evt) {
        const cell = this._current.cell;

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
        return true; 
    }

    #openEditor() {
        //console.log("StartEdit code: " + key);
        if (!this._current.editor) {
            this._current.editor = new CellEditor();
            this._current.editor.create(this._tableNode);
            this._current.editor.onKeyDown( e => this.#handleEditEvents(e));
            this._current.editor.onClose( e => this.#handleEditClosing(e));
        }
        const cell = this._current.cell;
        const text = cell.innerText ?? "";
        this._current.isEditing = true;
        this._current.editor.startEdit(text, cell);
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
        this._current.isEditing = false;
        let cell = event.cell ?? this._current.cell;
        if (event.commit) {
            cell.innerText = event.text;            
        }
        if (event.nav) {
            const nextCell = this.#getCellAt(event.nav.col, event.nav.row);
            if (nextCell) {
                cell = nextCell;
            }
        }        
        this.#focusCell(cell);
    }

    #getCellAt(colIndex, rowIndex) {
        const table = this._tableNode;        
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

    #onResize() {

    }


}