export class CellEditor {


    _rootElement;
    _inputBox;
    _key = (Math.random() + 1).toString(36).substring(7);

    _editorTemplate = `<div style="display: flex;position:absolute;visibility:hidden;white-space:nowrap">
    <input style="flex: 1; height: auto;" type="text"></input><button hidden></button>
    </div>`; 

    create(owner) {
        if (!this._rootElement) {
            const template = document.createElement("template");
            template.innerHTML = this._editorTemplate;
            const div = template.content.cloneNode(true);            
            this._inputBox = this.addEventHandlers(div);
            owner.parentNode.appendChild(div);
            this._rootElement = this._inputBox.parentNode;
        }
        console.log("Create " + this._key, this._rootElement);
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
        console.log("StartEdit " + this._key, this._rootElement);
        //this.copyStyles(cell, this._inputBox);
        this.moveTo(this._rootElement, cell);
        this._rootElement.style.visibility = "visible";
    }

    /**
     * Moves the given element (el) to same position as target
     * @param {HTMLElement} el 
     * @param {HTMLElement} target 
     */
    moveTo(el, target) {
        const bc = target.getBoundingClientRect();
        let rc = { left: bc.left, top: bc.top, width: bc.width, height: bc.height };
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
        const prc = target.offsetParent?.getBoundingClientRect();
        if (prc) {
             rc.left -= prc.left;
             rc.top -= prc.top;
            rc.left += target.offsetParent.offsetLeft;
            rc.top += target.offsetParent.offsetTop;
       }        
        el.style.left = (rc.left) + "px";
        el.style.top = (rc.top) + "px";
        el.style.width = rc.width + "px";
        el.style.height = rc.height + "px";
    }

    /**
     * Copies styles from one element to another
     * @param {HTMLElement} src
     * @param {HTMLElement} target
     */
    copyStyles(src, target) {
        for (var property in src) {
            var fresh = target.getPropertyValue(property)
            var current = window.getComputedStyle(src).getPropertyValue(property)
            if (fresh !== current) {
                return target.style.setProperty(property, fresh)
            }
        }        
    }

}