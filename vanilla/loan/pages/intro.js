import { Utils } from "../../libs/utils.js";
import { intro_template } from "./intro.html";

/**
 * @typedef { import("../models.js").IPage } IPage
 * @typedef { import("../models.js").IState } IState
 */

/** 
 * @type {IPage}
 */
export class IntroPage {

  /**
   * @type {HTMLInputElement}
   */
  #amountInputField;
  
  create() {
    const fragment = Utils.createFromTemplate(intro_template,
        "amount:blur", evt => this.#checkAmount(evt)
      );
    this.#amountInputField = fragment.querySelector("#amount");
    return fragment;
    
  }

  activate(state) {
    console.log("page1: activate", state);    
  }  

  validate(state) {
    const value = this.#amountInputField?.value;
    var total = parseInt(value || "0");
    if (total > 0) {
      state.amount = total;
      return { success: true, state: state };
    }
    return { success: false, message: "Du må fylle ut et gyldig lånebeløp" };
  }

  #checkAmount(blurEvent) {    
    console.log("Onblur", blurEvent)
  }



}