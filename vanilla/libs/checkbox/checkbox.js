import { Utils } from "../utils.js";
import { cssCache } from "../css.js";
import { chkTemplate } from "./template.html";
import { chkStyles } from "./style.css";

export class CheckBoxComponent extends HTMLElement {
    #view = null;
    #observer = null;

    static getTagName() {
        return "checkbox-component";
    }

    static get observedAttributes() {
        return ['checked', 'disabled'];
    }

    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.adoptedStyleSheets.push(cssCache(chkStyles));        
    }

    set checked(value) {
        const isChecked = Boolean(value);
        if (isChecked)
            this.setAttribute('checked', '');
        else
            this.removeAttribute('checked');
    }
      
    get checked() {
        return this.hasAttribute('checked');
    }
      
    set disabled(value) {
        const isDisabled = Boolean(value);
        if (isDisabled)
            this.setAttribute('disabled', '');
        else
            this.removeAttribute('disabled');
    }
    
    get disabled() {
        return this.hasAttribute('disabled');
    }    

    connectedCallback() {
        if (!this.hasAttribute('role'))
            this.setAttribute('role', 'checkbox');
          if (!this.hasAttribute('tabindex'))
            this.setAttribute('tabindex', 0);
        //this.addEventListener('keyup', this._onKeyUp);
        this.addEventListener('click', this.#onClick);
    
        this.#checkView();
    }

    disconnectedCallback() {
        //this.removeEventListener('keyup', this._onKeyUp);
        this.removeEventListener('click', this.#onClick);
    }

    #checkView() {
        if (this.ownerDocument.defaultView) {
            if (this.#view === null) {
                this.#view = Utils.createFromTemplate(chkTemplate);        
                this.shadowRoot.appendChild( this.#view );
                this.#observer = new MutationObserver(()=>this.#configureChildren());
                this.#observer.observe(this, { childList: true });
            } else {
                this.#refreshView();
            }
        }
    }

    #configureChildren() {
        // Do anything here?
        // const buttons = this.querySelectorAll("button");
        // console.log("We now have " + buttons.length + " buttons");
    }

    #refreshView() {
        console.log("checkbox.#refreshView");
    }

    #onClick(event) {
        this.#toggleChecked();
    }

    #toggleChecked() {
        if (this.disabled)
            return;
        this.checked = !this.checked;
        this.dispatchEvent(new CustomEvent('change', {
          detail: {
            checked: this.checked,
          },
          bubbles: true,
        }));
    }
  
}

Utils.defineComponent(CheckBoxComponent.getTagName(), CheckBoxComponent);
