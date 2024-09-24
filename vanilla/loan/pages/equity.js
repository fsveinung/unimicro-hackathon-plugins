import { Utils } from "../../libs/utils.js";
import { equity_template } from "./equity.html";
import { FormHelper } from "../../libs/formutils.js";

export class EquityPage {
  
  /** @type {FormHelper} */
  #formHelper;  

  create() {
    const fragment = Utils.createFromTemplate(equity_template);
    this.#formHelper = new FormHelper(fragment);
    return fragment;
  }

  activate(state) {
    this.#formHelper.setValues(state);
  }  

  validate(state) {
    state = this.#formHelper.getValues(state);
    var sum = parseInt(state.equity || "0");
    state.equity = sum;
    if (sum > 0 || state.kilde_ingen) {
      return { success: true, state: state };
    }
    return { success: false, message: "Du må fylle ut egenkapital, eller krysse av 'Ingen egenkapital'" };

  }

}
