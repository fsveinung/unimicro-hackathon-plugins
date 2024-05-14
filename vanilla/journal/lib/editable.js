import { CellEditor } from "./celleditor";

export class Editable {
    
    _tableNode;
    _columns;
    _current = {
        cell: undefined,
        editor: undefined
    }
    
    init(tableNode, colMap) {
        this._tableNode = tableNode;
        this._columns = colMap;
        this._tableNode.addEventListener("click", evt => this.onCellClick(evt));
        this._tableNode.addEventListener("keydown", evt => this.keyDown(evt));
        this._tableNode.addEventListener("resize", evt => this.onResize(evt));
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
                console.log("up");
                target = this.getCellAt(pos.col, pos.row - 1)
                break
            case 40: // DOWN
                console.log("down");
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
                    this.startEditMode(evt.key);
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
        // console.log(`isTyping(${evt.key})`)
        if (!(evt && evt.code && evt.key)) return false;
        return (evt.code === `Key${evt.key.toUpperCase()}`);
    }

    startEditMode(key) {
        console.log("StartEdit code: " + key);
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

    getCellPosition(cell) {
        return {
            row: cell.parentElement.rowIndex,
            col: cell.cellIndex
        };
    }    

    onResize() {

    }


}