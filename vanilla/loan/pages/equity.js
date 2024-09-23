import { Utils } from "../../libs/utils.js";
import { equity_template } from "./equity.html";

export class EquityPage {
  
  /** @type {HTMLInputElement} */
  #equityInput;

  create() {
    const fragment = Utils.createFromTemplate(equity_template);
    this.#equityInput = fragment.querySelector("#equity");
    return fragment;
  }

  activate(state) {
    if (state.equity) this.#equityInput.value = state.equity;
    console.log("page1: activate", state);    
  }  

  validate(state) {
    const value = this.#equityInput?.value;
    var sum = parseInt(value || "0");
    if (sum > 0) {
      state.equity = sum;
      return { success: true, state: state };
    }
    return { success: false, message: "Du må fylle ut egenkapital" };

  }

}
