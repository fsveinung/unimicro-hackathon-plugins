import { Utils } from "../../libs/utils.js";
import { security_template } from "./security.html";
import { CheckBoxComponent } from "../../libs/checkbox/checkbox.js";

export class SecurityPage {
  
  /** @type {HTMLElement[]} */
  #checkBoxes;

  #boxNames = [ 'property', 'receivables', 'tools', 'nothing', 'bail', 'stock', 'vehicle', 'other' ];

  create() {
    const fragment = Utils.createFromTemplate(security_template);
    this.#checkBoxes = fragment.querySelectorAll("checkbox-component");
    return fragment;
    
  }

  activate(state) {
    state.securityFlags ??= {};
    if (this.#checkBoxes.length) {
      for (let index = 0; index < this.#boxNames.length; index++) {
        const boxName = this.#boxNames[index];
        if (!!state.securityFlags[boxName]) {
          this.#checkBoxes[index].setAttribute("checked", true);
        } else {
          this.#checkBoxes[index].removeAttribute("checked");
        }
      }
      
    }
  }  

  validate(state) {
    state.securityFlags ??= {};
    if (this.#checkBoxes.length) {
      for (let index = 0; index < this.#boxNames.length; index++) {
        const boxName = this.#boxNames[index];
        state.securityFlags[boxName] = !!this.#checkBoxes[index].checked ?? false;
      }
    }

    return { success: true, state: state };
  }

}
