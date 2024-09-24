import { Utils } from "../../libs/utils.js";
import { future_template } from "./future.html";
import { Table } from "../../libs/editable/table.js";
import { Rows } from "../../libs/rows.js";

export class FuturePage {
  
  /** @type {Table} */
  #incomeTable;
  #incomes = new Rows(10);  

  create() {
    const year = new Date().getFullYear();
    const fragment = Utils.createFromTemplate(future_template);
    const tbl = fragment.querySelector("#future-incomes");
    if (!tbl) { console.error("Could not find the table!"); return; }
    this.#incomeTable = new Table();
    const fields = [ 
      { name: "name", label: "", type: "text", readOnly: true },
      { name: "year0", label: year.toString(), type: "largesum" },
      { name: "year1", label: (year+1).toString(), type: "largesum" },
      { name: "year2", label: (year+2).toString(), type: "largesum" },
    ];
    this.#incomeTable.setup( fields, true, tbl, this.#incomes );
    this.#incomeTable.addRows(5);
    this.#incomes.setValue("name", "Inntekter", 0);
    this.#incomes.setValue("name", "Varekostnader", 1);
    this.#incomes.setValue("name", "Lønn", 2);
    this.#incomes.setValue("name", "Andre kostnader", 3);
    this.#incomes.setValue("name", "Resultat", 4);
    this.#incomeTable.eventMap.on("change", change => this.#userInput(change));
    
    return fragment;
    
  }

  validate(state) {
    return { success: false, message: "Page3 is not ready yet" };
  }

  activate(state) {
    //debugger;
    console.log("step3", state);
    setTimeout(() => { this.#incomeTable?.focus(true); }, 100);      
  }

  /**
   * Handle table-user-input
   * @param {{ field: Field, rowIndex: number, value: any, commit: boolean }} change 
   */
  #userInput(change) {
    console.log("change", change);
    //this.#incomes.setValue(change.field.name, parseFloat(change.value), change.rowIndex);
    console.table(this.#incomes.Rows);
    console.log("Sum updated to:" + this.#incomes.sum("year0"));
    //this.querySelector("#sumIncome").innerText = this.#incomes.sum("amount").toString();
  }  

}
