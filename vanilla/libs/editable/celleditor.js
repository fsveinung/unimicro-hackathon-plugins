import { TableNavigation } from "./keys.js";
import { DomEvents } from "./domevents.js";
import { cellEditorTemplate } from "./celleditor.html";
import { EventMap } from "./eventmap.js";

export class CellEditor {

    eventMap = new EventMap();
    #table;
    #rootElement;
    #inputBox;
    #cell;
    #isClosing = false;
    #originalValue;
    /** @type {DomEvents} */ #events = new DomEvents();

    /**
     * Creates the movable editor and stores references to the given table
     * @param {HTMLTableElement} table 
     * @returns {HTMLInputElement}
     */
    create(table) {
        this.#table = table;
        if (!this.#rootElement) {
            const template = document.createElement("template");            
            template.innerHTML = cellEditorTemplate;
            const div = template.content.cloneNode(true);            
            this.#inputBox = this.#addEventHandlers(div);
            table.parentNode.appendChild(div);
            this.#rootElement = this.#inputBox.parentNode;
        }
        return this.#inputBox;
    }

    #addEventHandlers(root) {
        const input = root.querySelector("input");
        if (!input) return;
        this.#events.add(input, "keydown", event => this.#onEditKeyDown(event) );
        this.#events.add(input, "blur", event => this.#onBlur(event) );
        return input;
    }

    #onEditKeyDown(event) {

        // Escape?
        if (event.key === "Escape") {
            this.stopEdit(false);
            return;
        }

        // Check navigation?
        const caret = this.#getCaretPosition(this.#inputBox);
        let checkNavigationFirst = true;

        // Arrow-keys should be allowed to navigate inside text-input
        if (event.shiftKey || (event.key === "ArrowLeft" && !caret.isAtStart)
            || (event.key === "ArrowRight" && !caret.isAtEnd)) {
                checkNavigationFirst = false;
        }

        // Home/end keys should navigate inside text
        if (event.key === "Home" || event.key === "End") {
            checkNavigationFirst = false;
        }

        if (event.key === "Tab") checkNavigationFirst = true;

        // Check for navigation
        if (checkNavigationFirst) {
            const nav = TableNavigation.detectNavigation(this.#cell, event);
            if (nav) {
                this.stopEdit(true, nav);
                event.preventDefault();
                return;
            }            
        }

        // Custom eventhandler?
        this.eventMap.raiseEvent("keydown", event);

    }

    #onBlur(event) {
        //console.log("onBlur");
        this.stopEdit(true)
    }


    /**
     * Closes the editor
     * @param {boolean} commitChanges - true if changes should be commited
     * @param {{ col: number, row: number } || undefined} nav - optional suggested navigation after closing edtior
     */
    stopEdit(commitChanges, nav) {
        if (this.#isClosing) {
            return;
        }
        this.#isClosing = true;
        //try {
            // Prepare event-cargo
            const cargo = { 
                cell: this.#cell,
                text: this.#inputBox.value, 
                commit: !!commitChanges, 
                nav: nav 
            };
            // Set "commit" to false if value did not change
            if (cargo.commit && this.#originalValue === cargo.text ) {
                cargo.commit = false;
            }
            this.eventMap.raiseEvent("close", cargo);            
            this.#rootElement.style.visibility = "hidden";
            this.#table.focus();
        //} catch {}
        this.#isClosing = false;
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
        this.#originalValue = text;
        input.select();
        //input.focus();
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

    /**
     * Analyze caret-position inside a text-input
     * @param {HTMLInputElement} input 
     * @returns {{ index: number; isAtStart: boolean; isAtEnd: boolean; }}
     */
    #getCaretPosition(input) {
        var hasSelection = false;
        var caretDetails = {
            index: -1,
            isAtStart: false,
            isAtEnd: false
        };
        if (input.selectionStart || input.selectionEnd) {
            if (input.selectionEnd !== input.selectionStart) {
                hasSelection = true;
            }
        }
        caretDetails.index = 'selectionStart' in input ? input.selectionStart : '' || Math.abs(doc.selection.createRange().moveStart('character', -input.value.length));
        if (!hasSelection) {
            caretDetails.isAtStart = caretDetails.index <= 0;
            caretDetails.isAtEnd = caretDetails.index === input.value.length;
        }
        return caretDetails;
    }

}