import { CellEditor } from "./celleditor.js";

const Keys = {
    ARROW_LEFT: 37, ARROW_UP: 38, ARROW_RIGHT: 39, ARROW_DOWN: 40,
    ENTER: 13, ESC: 27, TAB: 9,
    F2: 113, F3: 114, F4: 115, 
    SPACE: 32, CTRL: 17, SHIFT: 16, HOME: 36, END: 35,
    INSERT: 45, DELETE: 46,
    PAGEUP: 33, PAGEDOWN: 34
};

export class Editable {
    
    _tableNode;
    _columns;
    _current = {
        cell: undefined,
        editor: undefined
    };

    
    init(tableNode, colMap) {
        this._tableNode = tableNode;
        this._columns = colMap;
        this._tableNode.addEventListener("click", evt => this.onCellClick(evt));
        this._tableNode.addEventListener("keydown", evt => this.keyDown(evt));
        this._tableNode.addEventListener("resize", evt => this.onResize(evt));
    }

    focus() {
        this.onCellClick();
    }

    onCellClick(event) {
        let cell = this._current.cell;

        // Event trigger?
        if (event && event.target) {
            cell = event.target;
            if (cell.nodeName !== "TD") return;
        }

        if (!cell) {
            cell = this.getCellAt(0 , 1);
        }

        this.focusCell(cell);

    }

    focusCell(cell) {
        if (!cell.getAttribute("tabindex")) {
            cell.setAttribute("tabindex", this.calcCellIndex(cell));
        }
        cell.focus();
        this._current.cell = cell;
    }

    keyDown(evt) {
        const cell = this._current.cell;
        const pos = this.getCellPosition(cell);
        let target;
        switch (evt.keyCode) {
            case 37: // LEFT
                target = cell.previousSibling;
                break;
            case 39: // RIGHT
                target = cell.nextSibling;
                break;
            case 38: // UP
                if (pos.row > 1) target = this.getCellAt(pos.col, pos.row - 1)
                break
            case 40: // DOWN
                target = this.getCellAt(pos.col, pos.row + 1)
                break
            case 9: // TAB
            case 13: // ENTER
                if (evt.shiftKey) {
                    target = cell.previousSibling
                        ?? this.getCellAt(9999, pos.row - 1);
                } else {
                    target = cell.nextSibling
                        ?? this.getCellAt(0, pos.row + 1);
                }
                break;
            case 36: // HOME
                target = evt.ctrlKey ? target = this.getCellAt(0, 1) 
                    : target = this.getCellAt(0, pos.row);
                break;
            case 35: // END
                target = evt.ctrlKey ? target = this.getCellAt(9999, -1)
                : target = this.getCellAt(9999, pos.row);
                break;
            default:
                if (this.isTyping(evt)) {
                    this.openEditor(evt.key);
                }
                break;
        }
        if (target) {
            const newPos = this.getCellPosition(target);
            if (newPos.row === 0) return;
            evt.preventDefault();
            this.focusCell(target);
        }
    }

    isTyping(evt) {
        console.log(`isTyping(key:${evt.key}, code:${evt.code}, keyCode:${evt.keyCode})`);
        if (!(evt && evt.code && evt.key)) return false;
        const isRegularKey = (evt.code === `Key${evt.key.toUpperCase()}`);
        if (isRegularKey) return true;
        // todo: check for virtual keys to ignore
        return true; 
    }

    openEditor(key) {
        console.log("StartEdit code: " + key);
        if (!this._current.editor) {
            this._current.editor = new CellEditor();
            const input = this._current.editor.create(this._tableNode);
        }
        const cell = this._current.cell;
        const pos = this.getCellPosition(cell);
        const text = cell.innerText ?? "";
        this._current.editor.startEdit(text, cell, pos);
    }

    getCellAt(colIndex, rowIndex) {
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

    calcCellIndex(cell) {
        const pos = this.getCellPosition(cell);
        return ((pos.row * 50) + pos.col) + 1000;
    }

    /**
     * Returns the col and  row indexes of the given cell.
     * @param {HTMLTableCellElement} cell 
     * @returns {{ row: number, col: number }}
     */
    getCellPosition(cell) {
        return {
            row: cell.parentElement.rowIndex,
            col: cell.cellIndex
        };
    }    

    onResize() {

    }


}