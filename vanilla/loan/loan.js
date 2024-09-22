import { Utils } from "../libs/utils.js";
import { template } from "./loan.html";
import { styles } from "./style.css";
// import { Table } from "../libs/editable/table.js";
// import { Rows } from "../libs/rows.js";
import { LoanPage1 } from "./pages/page1.js";
import { LoanPage2 } from "./pages/page2.js";
import { LoanPage3 } from "./pages/page3.js";

/**
 * @typedef { import("./models").IPage } IPage
 * @typedef { import("./models").IState } IState
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
  #pageIndex = 0;

  /** Current wizard state 
   * @type {IState}
   */
  #state = {
    amount: 0
  }

  /** List of page-instances
   * @type {IPage[]}
  */
  #pages = [];

  
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
    this.#addPage(new LoanPage1());
    this.#addPage(new LoanPage2());
    this.#addPage(new LoanPage3());
  }

  /**
   * Adds a page to the wizard by calling .create on the page
   * @param {IPage} page 
   */
  #addPage(page) {
    this.#pages.push(page);
    const pages = this.querySelectorAll(".page");    
    pages[this.#pages.length - 1].appendChild(page.create());    
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

  #validateCurrentPage() {
    if (this.#pageIndex >= this.#pages.length) return false;
    const page = this.#pages[this.#pageIndex];
    const result = page.validate(this.#state);
    console.log("Updated state:", this.#state);
    if (result.success) return true;
    this.#api.showAlert(result.message, 3, 3);
  }

  #moveNext() {
    if (!this.#validateCurrentPage()) return;
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
    this.#api.showAlert("Bare følg instruksjonene så bør det gå fint :)", 2);
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
