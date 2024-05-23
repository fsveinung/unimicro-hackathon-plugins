import { TableNavigation } from "./keys.js";
import { DomEvents } from "../../libs/domevents.js";

export class CellEditor {

    #table;
    #rootElement;
    #inputBox;
    #events = new DomEvents();
    #cell;
    #eventMap = new WeakMap();

    #editorTemplate = `<div style="display: flex;position:absolute;visibility:hidden;white-space:nowrap">
    <input style="flex: 1; height: auto;" type="text"></input><button hidden></button>
    </div>`; 

    /**
     * Creates the movable editor and stores references to the given table
     * @param {HTMLTableElement} table 
     * @returns {HTMLInputElement}
     */
    create(table) {
        this.#table = table;
        if (!this.#rootElement) {
            const template = document.createElement("template");            
            template.innerHTML = this.#editorTemplate;
            const div = template.content.cloneNode(true);            
            this.#inputBox = this.#addEventHandlers(div);
            table.parentNode.appendChild(div);
            this.#rootElement = this.#inputBox.parentNode;
        }
        return this.#inputBox;
    }

    onKeyDown(callBack) {
        this.#eventMap.set("keydown", callBack);
    }

    onClose(callBack) {
        this.#eventMap.set("close", callBack);
    }

    #addEventHandlers(root) {
        const input = root.querySelector("input");
        if (!input) return;
        this.#events.create(input, "keydown", event => this.#onEditKeyDown(event) );


        return input;
    }

    #onEditKeyDown(event) {

        if (this.#eventMap.has("keydown")) {
            const fx = this.#eventMap.get("keydown");
            fx(event);
            return;
        }

        console.log("onEditKeyDown: " + event.code);
        const nav = TableNavigation.detectNavigation(this.#cell, event);
        if (nav) {
            this.stopEdit(true);
        }
    }

    /**
     * Closes the editor
     * @param {boolean} commitChanges 
     */
    stopEdit(commitChanges) {
        if (this.#eventMap.has("close")) {
            const fx = this.#eventMap.get("close");
            const content = { text: this.#inputBox.value, commit: !!commitChanges };
            fx(content);
        }
        this.#rootElement.style.visibility = "hidden";
        this.#table.focus();
    }

    /**
     * Starts the editor over the given cell
     * @param {string} text
     * @param {HTMLTableCellElement} cell 
     */
    startEdit(text, cell) {
        //this.copyStyles(cell, this._inputBox);
        this.#cell = cell;
        this.moveTo(this.#rootElement, cell);
        this.#rootElement.style.visibility = "visible";
        const input = this.#inputBox;
        input.value = text;
        input.focus();
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
        el.style.left = rc.left + "px";
        el.style.top = rc.top + "px";
        el.style.width = rc.width + "px";
        el.style.height = rc.height + "px";
    }

    /**
     * Copies styles from one element to another
     * @param {HTMLElement} src
     * @param {HTMLElement} target
     */
    #copyStyles(src, target) {
        for (var property in src) {
            var fresh = target.getPropertyValue(property);
            var current = window.getComputedStyle(src).getPropertyValue(property);
            if (fresh !== current) {
                return target.style.setProperty(property, fresh);
            }
        }        
    }

}