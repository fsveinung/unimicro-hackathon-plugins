export const KeyName = {
    ARROW_LEFT: "ArrowLeft", ARROW_UP: "ArrowUp", ARROW_RIGHT: "ArrowRight", ARROW_DOWN: "ArrowDown",
    ENTER: "Enter", ESC: "Escape", TAB: "Tab"
};

export class CellPosition {
    col = 0;
    row = 0;
    numCols = 0;
    numRows = 0;

    constructor(col, row, numCols, numRows) {
        this.col = col;
        this.row = row;
        this.numCols = numCols;
        this.numRows = numRows;
    }

    /**
     * Adds a number to the given column and returns the object
     * @param {number} number
     * @param {boolean | undefined} wrap
     * @returns {CellPosition}
     */
    addCol(number, wrap) {

        this.col += number;
        
        if (this.col < 0) { 
            if (wrap && this.row > 1) { 
                this.col = this.numCols - 1; 
                this.row--; 
            } else {
                this.col = 0;
            }
        }

        if (this.col > this.numCols - 1) {
            if (wrap && this.row < this.numRows - 1) {
                this.col = 0; 
                this.row++; 
            }
        }

        return this;
    }

    /**
     * Adds a number to the given row and returns the object
     * @param {number} number 
     * @returns {CellPosition}
     */
    addRow(number) {
        this.row += number;
        if (this.row < 1) this.row = 1;
        if (this.row > this.numRows - 1) this.row = this.numRows - 1;
        return this;
    }

    /**
     * Sets a position
     * @param {number} col 
     * @param {number} row 
     * @returns {CellPosition}
     */
    setPos(col, row) {
        this.col = col;
        this.row = row;
        if (col < 0) {
            this.col = this.numCols - 1;
        }
        if (row < 0) {
            this.rows = this.numRows - 1;
        }
        if (row === 0) {
            this.row = 1;
        }
        if (col > this.numCols + 1) this.col = this.numCols - 1;
        if (row > this.numCols + 1) this.row = this.numRows - 1;
        return this;
    }
}

export class TableNavigation {
    
    /**
     * Returns position of the given cell
     * @param {HTMLTableCellElement} cell 
     * @returns {CellPosition}
     */
    static getCellPosition(cell) {
        const tr = cell.parentElement;
        const numCols = tr.cells?.length || 0;
        const numRows = (tr.parentElement.lastElementChild.rowIndex || -1) + 1;
        return new CellPosition(cell.cellIndex, cell.parentElement.rowIndex, numCols, numRows );
    }

    /**
     * Returns suggested new cell position based on keyboard input
     * @param {HTMLTableCellElement} cell 
     * @param {KeyboardEvent} event 
     * @returns {{ row: number, col: number } | undefined}
     */
    static detectNavigation(cell, event) {
        const pos = this.getCellPosition(cell);
        switch (event.key) {
            case KeyName.ARROW_LEFT: return pos.addCol(-1);
            case KeyName.ARROW_RIGHT: return pos.addCol(1);
            case KeyName.ARROW_UP: return pos.addRow(-1);
            case KeyName.ARROW_DOWN: return pos.addRow(+1);
            case KeyName.TAB:
                return (event.shiftKey) ? pos.addCol(-1, true) : pos.addCol(1, true);
            case KeyName.ENTER:
                return pos.addCol(1, true);
            case "Home":
                return event.ctrlKey ? pos.setPos(0, 0) : pos.setPos(0, pos.row);
            case "End":
                return event.ctrlKey ? pos.setPos(-1, -1) : pos.setPos(pos.numCols - 1, pos.row);
        }
    }
}