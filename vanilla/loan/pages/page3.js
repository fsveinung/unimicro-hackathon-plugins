import { Utils } from "../../libs/utils.js";
import { page3_template } from "./page3.html";
import { Table } from "../../libs/editable/table.js";
import { Rows } from "../../libs/rows.js";

export class LoanPage3 {
  
  /** @type {Table} */
  #incomeTable;
  #incomes = new Rows(100);  

  create() {
    const fragment = Utils.createFromTemplate(page3_template);
    
      const tbl = fragment.querySelector("#future-incomes");
      if (!tbl) { console.error("Could not find the table!"); return; }
      this.#incomeTable = new Table();
      const fields = [ 
        { name: "year", label: "Årstall", type: "integer" },
        { name: "source", label: "Kommentar", type: "string" },
        { name: "amount", label: "Beløp", type: "money" },
      ];
      this.#incomeTable.setup( fields, true, tbl );
      this.#incomeTable.eventMap.on("change", change => this.#userInput(change));
      this.#incomeTable.addRows(5);
    
    //setTimeout(() => { this.#incomeTable?.focus(true); }, 100);      
    return fragment;
    
  }

  validate(state) {
    return { success: false, message: "Page3 is not ready yet" };
  }

  /**
   * Handle table-user-input
   * @param {{ field: Field, rowIndex: number, value: any, commit: boolean }} change 
   */
  #userInput(change) {
    this.#incomes.setValue(change.field.name, parseFloat(change.value), change.rowIndex);
    console.log("Sum updated to:" + this.#incomes.sum("amount"));
    //this.querySelector("#sumIncome").innerText = this.#incomes.sum("amount").toString();
  }  

}
