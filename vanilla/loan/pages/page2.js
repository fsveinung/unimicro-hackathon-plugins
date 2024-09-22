import { Utils } from "../../libs/utils.js";
import { page2_template } from "./page2.html";

export class LoanPage2 {
  
  create() {
    const fragment = Utils.createFromTemplate(page2_template);
    return fragment;
    
  }

  validate(state) {
    console.log("page2-validation..");
    return { success: false, message: "Page2 is not ready yet" };
  }

  activate(state) {
    console.log("page2: activate", state);    
  }  

}