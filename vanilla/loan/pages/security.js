import { Utils } from "../../libs/utils.js";
import { security_template } from "./security.html";
import { FormHelper } from "../../libs/formHelper.js";

export class SecurityPage {
  
  /** @type {FormHelper} */
  #formHelper;

  create() {
    const fragment = Utils.createFromTemplate(security_template);
    this.#formHelper = new FormHelper(fragment);
    return fragment;
    
  }

  activate(state) {
    this.#formHelper.setValues(state.securityFlags);
  }  

  validate(state) {
    state.securityFlags = {...(state.securityFlags ?? {}), ...this.#formHelper.getValues()};
    return { success: true, state: state };
  }

}
