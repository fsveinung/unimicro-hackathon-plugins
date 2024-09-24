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

  /** @type {FormHelper} */
  #formHelper;
    
  create() {
    const fragment = Utils.createFromTemplate(intro_template,
        "amount:blur", evt => this.#checkAmount(evt)
      );
    this.#formHelper = new FormHelper(fragment);
    return fragment;
    
  }

  activate(state) {
    this.#formHelper.setValues(state);
  }  

  validate(state) {
    state = this.#formHelper.getValues(state);
    var sum = parseInt(state.amount || "0");
    state.amount = sum;
    if (sum > 0) {
      return { success: true, state: state };
    }
    delete state.amount;
    return { success: false, message: "Du må fylle ut egenkapital, eller krysse av 'Ingen egenkapital'" };
  }

  #checkAmount(blurEvent) {    
    console.log("Onblur", blurEvent)
  }



}
