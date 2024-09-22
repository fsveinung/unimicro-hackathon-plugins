import { Utils } from "../libs/utils.js";
import { template } from "./loan.html";
import { styles } from "./style.css";
import { Table } from "../libs/editable/table.js";
import { Rows } from "../libs/rows.js";
import { LoanPage1 } from "./pages/page1.js";

/**
 * @typedef { import("./models").IPage } IPage
 */

class Loan extends HTMLElement {

  #api = null;
  #company = null;
  #wizard = undefined;
  #steps = [
    { label: "Om finansieringen", value: "page1", ref: undefined },
    { label: "Sikkerhet", value: "page2", ref: undefined },
    { label: "Fremtidige inntekter", value: "page3", ref: undefined}    
  ];
  #incomes = new Rows(100);
  #pageIndex = 0;

  /** List of page-instances
   * @type {IPage[]}
  */
  #pages = [];
  
  /** Table property reference
   * @type {Table}
  */
  #incomeTable;

  constructor() {
    super();
  }

  connectedCallback() {
    this.#updateUserInterface();
  }

  set api(v) {
    this.#api = v;
    this.#updateUserInterface();
  }

  #updateUserInterface() {
    if (this.ownerDocument.defaultView) {
      if (this.childNodes.length == 0) {
        this.#reateContent();
        setTimeout(() => { this.#setupWizard(); }, 0);
      } else {
        this.#updateContent();
      }
    }
  }

  #reateContent() {
    this.appendChild(
      Utils.createFromTemplate(template,
        "btnHelp:click", () => this.#help(),
        "bntBack:click", () => this.#moveBack(),
        "btnNext:click", () => this.#moveNext()
      )
    );
    this.#setupPages();
    this.#showPage("page1");
  }

  #setupPages() {
    this.#addPageAt(new LoanPage1(), 0);
  }

  /**
   * Adds a page to the wizard by calling .create on the page
   * @param {IPage} page 
   * @param {number} index 
   */
  #addPageAt(page, index) {
    this.#pages.push(page);
    const pages = this.querySelectorAll(".page");    
    pages[index].appendChild(page.create());    
  }

  #setupWizard() {
    if (!this.#api?.factory) { console.log("No factory"); return; }
    this.#wizard = this.#api.factory.create("rig-wizard", this );
    if (this.#wizard?.instance) {
      const wiz = this.#wizard.instance;
      wiz.steps = this.#steps;
      wiz.activeStepValue = "page1";
      wiz.ngOnChanges();
      wiz.refresh();
    }
  }

  #canMoveNext() {
    if (this.#pageIndex >= this.#pages.length) return false;
    const page = this.#pages[this.#pageIndex];
    const result = page.validate();
    if (result.success) return true;
    this.#api.showAlert(result.message);
  }

  #moveNext() {
    if (!this.#canMoveNext()) return;
    const wiz = this.#wizard?.instance;
    if (wiz && wiz.activeIndex < wiz.steps.length - 1) {
      wiz.activeStepValue = wiz.steps[wiz.activeIndex + 1].value;
      this.#showPage(wiz.activeStepValue);
      wiz.ngOnChanges();
      wiz.refresh();
    }
  }

  #moveBack() {
    const wiz = this.#wizard?.instance;
    if (wiz && wiz.activeIndex > 0) {
      wiz.activeStepValue = wiz.steps[wiz.activeIndex - 1].value;
      this.#showPage(wiz.activeStepValue);
      wiz.ngOnChanges();
      wiz.refresh();
    }
  }

  #help() {
    this.#api.showAlert("Help is on the way!!");
  }

  #showPage(stepValue) {
    let index = 0;
    for (let step of this.#steps) {
        if (!step.ref) step.ref = this.getElementsByClassName("page")[index++];
        if (step.value == stepValue) {
            step.ref.getElementsByClassName("pagetitle")[0].innerText = step.label;
            this.onShowPage(step);
            step.ref.classList.remove("hidden");
        } else {
            step.ref.classList.add("hidden");
        }
    }
  }

  onShowPage(step) {
    if (step.value === "page3") {
      if (!this.#incomeTable) {
        const tbl = step.ref.querySelector("#future-incomes");
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
      }
      setTimeout(() => { this.#incomeTable?.focus(true); }, 100);    
    }
  }

  /**
   * Handle user-input
   * @param {{ field: Field, rowIndex: number, value: any, commit: boolean }} change 
   */
  #userInput(change) {
    this.#incomes.setValue(change.field.name, parseFloat(change.value), change.rowIndex);
    this.querySelector("#sumIncome").innerText = this.#incomes.sum("amount").toString();
  }

  async #updateContent() {
    if (this.#api) {
        this.#company = await this.#api.http.get('/api/biz/companysettings/1?select=CompanyName');
    }
  }


}

if (Utils.defineComponent("micro-plugin", Loan)) {
  Utils.addStyleSheet("micro-plugin-spinnerstylesheet", styles);
}
