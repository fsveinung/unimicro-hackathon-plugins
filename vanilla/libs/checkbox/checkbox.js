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

    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.adoptedStyleSheets.push(cssCache(chkStyles));        
    }

    connectedCallback() {
        this.#checkView();
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
}

Utils.defineComponent(CheckBoxComponent.getTagName(), CheckBoxComponent);
