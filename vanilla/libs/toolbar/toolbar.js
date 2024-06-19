import { Utils } from "../utils.js";
import { cssCache } from "../css.js";
import { tbTemplate } from "./template.html";
import { tbStyles } from "./style.css";

export class ToolbarComponent extends HTMLElement {
    #view = null;
    #observer = null;

    static getTagName() {
        return "toolbar-component";
    }

    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.adoptedStyleSheets.push(cssCache(tbStyles));        
    }

    connectedCallback() {
        this.#checkView();
    }

    #checkView() {
        if (this.ownerDocument.defaultView) {
            if (this.#view === null) {
                this.#view = Utils.createFromTemplate(tbTemplate);        
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
        const buttons = this.querySelectorAll("button");
        console.log("We now have " + buttons.length + " buttons");
    }

    #refreshView() {
        console.log("toolbar.#refreshView");
    }
}

Utils.defineComponent(ToolbarComponent.getTagName(), ToolbarComponent);
