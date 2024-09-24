import { Utils } from "../../libs/utils.js";
import { future_template } from "./future.html";
import { Table } from "../../libs/editable/table.js";
import { Rows } from "../../libs/rows.js";

export class FuturePage {
  
  /** @type {Table} */
  #incomeTable;
  #incomes = new Rows(10); 
  #appService;

  create() {
    const year = new Date().getFullYear();
    const fragment = Utils.createFromTemplate(future_template, 
      "btnSuggest:click", evt => this.#suggestIncome(evt)
    );
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

  activate(state, appService) {
    this.#appService = appService;
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
    this.#incomes.setValue(change.field.name, change.value, change.rowIndex);
    this.#recalcSum(change.field.name);
  }
  
  #recalcSum(fieldName) {
    const income = this.#incomes.getValue(fieldName, 0, 0);
    const cost_of_goods = this.#incomes.getValue(fieldName, 1, 0);
    const cost_of_payroll = this.#incomes.getValue(fieldName, 2, 0);
    const cost_other = this.#incomes.getValue(fieldName, 3, 0);
    const outcome = income - (cost_of_goods + cost_of_payroll + cost_other);
    this.#incomes.setValue(fieldName, outcome, 4);    
  }

  async #suggestIncome(evt) {

    evt.target.setAttribute("aria-busy", true);

    const rows = await this.#appService.http.get("/api/biz/accounts?action=profit-and-loss-grouped");    
    
    setTimeout(() => evt.target.removeAttribute("aria-busy"), 500);

    if (!Array.isArray(rows)) {
      this.#appService.showAlert("Ingen data fra API...", 3, 3);
      return;
    }

    console.table(rows);

    var sales = rows.find( item => item.GroupNumber == 30);
    var goods = rows.find( item => item.GroupNumber == 40);
    var payroll = rows.find( item => item.GroupNumber == 50);
    var cost = rows.find( item => item.GroupNumber == 60);
    var finance = rows.find( item => item.GroupNumber == 80);
    
    var ebit = rows.find( item => item.ID == 601);

    this.#incomes.setValue("year0", this.#extrapolatePeriodSum(sales.Sum, true), 0);
    this.#incomes.setValue("year0", this.#extrapolatePeriodSum(goods.Sum), 1);
    this.#incomes.setValue("year0", this.#extrapolatePeriodSum(payroll.Sum), 2);
    this.#incomes.setValue("year0", this.#extrapolatePeriodSum(cost.Sum), 3);

    this.#recalcSum("year0");

    this.#appService.showAlert("Forslaget er lagt inn basert på tilgjengelige data hittil i år, og ekstrapolert for de kommende månedene.",  );

  }

  #extrapolatePeriodSum(sum, flipSign) {
    sum ??= 0;
    const period = new Date().getMonth() + 1;
    const day = new Date().getDate();
    const newSum = sum + (((12 - period)/12) * sum);
    return flipSign ? -newSum : newSum;
  }



}
