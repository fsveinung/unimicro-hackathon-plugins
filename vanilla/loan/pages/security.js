import { Utils } from "../../libs/utils.js";
import { security_template } from "./security.html";

export class SecurityPage {
  
  create() {
    const fragment = Utils.createFromTemplate(security_template);
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
