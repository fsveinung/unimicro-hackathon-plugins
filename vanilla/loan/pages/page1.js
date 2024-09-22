import { Utils } from "../../libs/utils.js";
import { page1_template } from "./page1.html";

/**
 * @typedef { import("../models").IPage } IPage
 */

/** 
 * @type {IPage}
 */
export class LoanPage1 {

  create() {
    return Utils.createFromTemplate(page1_template,
        "amount:blur", evt => this.checkAmount(evt)
      );
  }

  validate() {
    return { success: false, message: "Du må fylle ut lånebeløp!" };
  }

  checkAmount(blurEvent) {    
    console.log("Onblur", blurEvent)
  }

}
