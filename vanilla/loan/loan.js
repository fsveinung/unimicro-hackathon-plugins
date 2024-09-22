import { Utils } from "../libs/utils.js";
import { template } from "./loan.html";
import { styles } from "./style.css";
import { LoanPage1 } from "./pages/page1.js";
import { EquityPage } from "./pages/equity.js";
import { LoanPage2 } from "./pages/page2.js";
import { LoanPage3 } from "./pages/page3.js";

/**
 * @typedef { import("./models").IPage } IPage
 * @typedef { import("./models").IState } IState
 * @typedef { label: string, value: string, el?: HTMLElement, page?: IPage } Step
 */

class Loan extends HTMLElement {

  #api = null;
  #company = null;
  #wizard = undefined;

  /** @type {Step[]} */
  #steps = [
    { label: "Om finansieringen", value: "page1", el: undefined, page: undefined },
    { label: "Egenkapital", value: "page1_1", el: undefined, page: undefined },
    { label: "Sikkerhet", value: "page2", el: undefined, page: undefined },
    { label: "Fremtidige inntekter", value: "page3", el: undefined, page: undefined}    
  ];

  get #currentStepIndex() {
    const wiz = this.#wizard?.instance;
    return !!wiz ? wiz.activeIndex : 0;
  }  

  /** Current wizard state 
   * @type {IState}
   */
  #state = {
    amount: 0
  }

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
    this.#addPage(new EquityPage());
    this.#addPage(new LoanPage2());
    this.#addPage(new LoanPage3());
  }

  /**
   * Adds a page to the wizard by calling .create on the page
   * @param {IPage} page 
   */
  #addPage(page) {
    const index = this.#steps.findIndex( s => s.page === undefined);
    const step = this.#steps[index];
    step.page = page;
    const pageElements = this.querySelectorAll(".page");    
    pageElements[index].appendChild(page.create());    
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

  #validateCurrentPage(showValidationErrors) {
    const index = this.#currentStepIndex;
    if (index + 1 >= this.#steps.length) return false;
    const page = this.#steps[index].page;
    const result = page.validate(this.#state);
    console.log("Updated state:", this.#state);
    if (result.success) return true;
    if (!!showValidationErrors)
      this.#api.showAlert(result.message, 3, 3);
    return false;
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
      this.#validateCurrentPage(false);
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
        if (!step.el) step.el = this.getElementsByClassName("page")[index++];
        if (step.value == stepValue) {
            step.el.getElementsByClassName("pagetitle")[0].innerText = step.label;
            this.onShowPage(step, index-1 );
            step.el.classList.remove("hidden");
        } else {
            step.el.classList.add("hidden");
        }
    }
  }

  onShowPage(step, index) {
    if (step.page)
      step.page.activate(this.#state);
    else
      console.error("No page!", step);
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
