import { Utils } from "../../libs/utils.js";
import { balance_template } from "./balance.html";
import { FormHelper } from "../../libs/formHelper.js";

export class BalancePage {
  
  /** @type {FormHelper} */
  #formHelper;  

  create() {
    const fragment = Utils.createFromTemplate(balance_template);
    this.#formHelper = new FormHelper(fragment);
    return fragment;
  }

  activate(state) {
    this.#formHelper.setValues(state);
  }  

  validate(state) {

    state = this.#formHelper.getValues(state);
    return { success: true, state: state };

}

}
