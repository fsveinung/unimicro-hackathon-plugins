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
    if (!tbl) { console.error("Could not find the table #future-incomes"); return; }
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
    this.#incomeTable.eventMap.on("startEdit", evt => this.#onStartEdit(evt));
    
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

  #onStartEdit(event) {
    if (event.rowIndex >= 4) event.allow = false;
  }

  /**
   * Handle table-user-input
   * @param {{ field: Field, rowIndex: number, value: any, commit: boolean }} change 
   */
  #userInput(change) {
    if (change.rowIndex >= 4) { return; }
    this.#incomes.setValue(change.field.name, change.value, change.rowIndex);
    const income = this.#incomes.getValue(change.field.name, 0, 0);
    const cost_of_goods = this.#incomes.getValue(change.field.name, 1, 0);
    const cost_of_payroll = this.#incomes.getValue(change.field.name, 2, 0);
    const cost_other = this.#incomes.getValue(change.field.name, 3, 0);
    const outcome = income - (cost_of_goods + cost_of_payroll + cost_other);
    const formattedOutcome = outcome.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    this.#incomes.setValue(change.field.name, formattedOutcome, 4);

    console.table(this.#incomes.Rows);
    
  }  

}
