import { Utils } from "../../libs/utils.js";
import { page1_template } from "./page1.html";

export class LoanPage1 {

  appendTo(parent) {
    parent.appendChild(
      Utils.createFromTemplate(page1_template)
    );
  }


}
