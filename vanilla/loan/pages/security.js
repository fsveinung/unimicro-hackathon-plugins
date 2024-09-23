import { Utils } from "../../libs/utils.js";
import { security_template } from "./security.html";
import { CheckBoxComponent } from "../../libs/checkbox/checkbox.js";

export class SecurityPage {
  
  create() {
    const fragment = Utils.createFromTemplate(security_template);
    return fragment;
    
  }

  validate(state) {
    console.log("page2-validation..");
    return { success: true };
  }

  activate(state) {
    console.log("page2: activate", state);    
  }  

}
