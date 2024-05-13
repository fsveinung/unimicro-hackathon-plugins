export class CellEditor {

    _rootElement;
    _inputBox;

    _editorTemplate = `<div style="position:absolute;display:none;white-space:nowrap">
    <input type="text"></input><button hidden></button>
    </div>`; 

    create(owner) {
        if (!this._rootElement) {
            const template = document.createElement("template");
            template.innerHTML = _editorTemplate;
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

}