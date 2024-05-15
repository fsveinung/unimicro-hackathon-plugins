export class CellEditor {

    _rootElement;
    _inputBox;

    _editorTemplate = `<div style="position:absolute;display:none;white-space:nowrap">
    <input type="text"></input><button hidden></button>
    </div>`; 

    create(owner) {
        if (!this._rootElement) {
            const template = document.createElement("template");
            template.innerHTML = this._editorTemplate;
            this._rootElement = template.content.cloneNode(true);            
            owner.parentNode.appendChild(this._rootElement);
            this._inputBox = this.addEventHandlers(this._rootElement);
        }
        return this._inputBox;
    }

    addEventHandlers(root) {
        const input = root.querySelector("input");
        return input;
    }

    /**
     * Starts the editor over the given cell
     * @param {string} text
     * @param {HTMLTableCellElement} cell 
     * @param {{col: number, row: number}} pos
     */
    startEdit(text, cell, pos) {
        this.copyStyles(cell, this._inputBox);
    }

    /**
     * Copies styles from one element to another
     * @param {HTMLElement} src
     * @param {HTMLElement} target
     */
    copyStyles(src, target) {
        for (var property in src) {
            var fresh = computed.getPropertyValue(property)
            var current = window.getComputedStyle(src).getPropertyValue(property)
            if (fresh !== current) {
                return target.style.setProperty(property, fresh)
            }
        }        
    }

}