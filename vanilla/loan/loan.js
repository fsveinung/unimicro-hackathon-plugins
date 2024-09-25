import { Utils } from "../libs/utils.js";
import { template } from "./loan.html";
import { styles } from "./style.css";
import { IntroPage } from "./pages/intro.js";
import { EquityPage } from "./pages/equity.js";
import { SecurityPage } from "./pages/security.js";
import { FuturePage } from "./pages/future.js";
import { BalancePage } from "./pages/balance.js";
import { SummaryPage } from "./pages/summary.js";
import { CheckBoxComponent } from "../libs/checkbox/checkbox.js";

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
    { label: "Lånebeløp", value: "intro", el: undefined, page: undefined },
    { label: "Egenkapital", value: "equity", el: undefined, page: undefined },
    { label: "Sikkerhet", value: "security", el: undefined, page: undefined },
    { label: "Fremtidige inntekter", value: "future", el: undefined, page: undefined},
    { label: "Endring i balansen", value: "balance", el: undefined, page: undefined},
    { label: "Oppsummering", value: "summary", el: undefined, page: undefined}
  ];

  get #currentStepIndex() {
    const wiz = this.#wizard?.instance;
    return !!wiz ? wiz.activeIndex : 0;
  }  

  /** Current wizard state 
   * @type {IState}
   */
  #state = {
    amount: undefined,
    equity: undefined
  }

  constructor() {
    super();
  }

  connectedCallback() {
    this.#updateUserInterface();
  }

  set api(v) {
    this.#api = v;
    this.#updateContent();
  }

  #updateUserInterface() {
    if (this.ownerDocument.defaultView) {
      if (this.childNodes.length == 0) {
        this.#reateContent();
        setTimeout(() => { this.#setupWizard(); }, 0);
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
    this.#showPage(this.#steps[0].value);
  }

  #setupPages() {
    this.#addPage(new IntroPage());
    this.#addPage(new EquityPage());
    this.#addPage(new SecurityPage());
    this.#addPage(new FuturePage());
    this.#addPage(new BalancePage());
    this.#addPage(new SummaryPage());
  }

  /**
   * Adds a page to the wizard by calling .create on the page
   * @param {IPage} page 
   */
  #addPage(page) {
    // find next empty slot
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
      wiz.activeStepValue = this.#steps[0].value;
      wiz.ngOnChanges();
      wiz.refresh();
    }
  }

  #validateCurrentPage(showValidationErrors) {
    const index = this.#currentStepIndex;
    if (index + 1 >= this.#steps.length) return false;
    const page = this.#steps[index].page;
    const result = page.validate(this.#state);
    this.#showSummary(this.#state);
    this.#saveState(this.#state, this.#company);
    if (result.success) {
      return true;
    }
    if (!!showValidationErrors)
      this.#api.showAlert(result.message, 3, 3);
    return false;
  }

  #moveNext() {    
    if (!this.#validateCurrentPage(true)) return;
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
    
    if (stepValue === undefined) {
      const index = this.#currentStepIndex;
      const step = this.#steps[index];
      stepValue = step.value;
    }

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
      step.page.activate(this.#state, this.#api);
    else
      console.error("No page!", step);
  }

  async #updateContent() {
    if (this.#api && !this.#company) {
        this.#company = await this.#api.http.get('/api/biz/companysettings/1?select=CompanyName,OrganizationNumber');
        this.#loadState(this.#state, this.#company);
        this.#showPage();
    }
  }

  #showSummary(state) {

    const el = this.querySelector("#summary");
    const sums = this.querySelectorAll(".amount");

    if (state.amount + state.equity > 0) {
      el.classList.remove("hidden");
    } else {
      el.classList.add("hidden");
    }

    var fmt = new Intl.NumberFormat();
    sums[0].innerText = fmt.format(state.amount);
    sums[1].innerText = fmt.format(state.equity);
    sums[2].innerText = fmt.format(state.amount + state.equity);

  }

  #loadState(defaultState, company) {
    const key = this.#getStateKey(company);
    const jsonState = localStorage.getItem(key);
    console.log("State loaded from " + key);
    if (jsonState) {
      try {
      this.#state = JSON.parse(jsonState);
      } catch {
        return defaultState;
      }
      return JSON.parse(jsonState);
    }
    return defaultState;
  }

  #saveState(state, company) {
    const key = this.#getStateKey(company);
    localStorage.setItem(key, JSON.stringify(state));
  }

  #getStateKey(company) {
    let str = company?.CompanyName ?? "Any";
    return "loanState_" + str.replace(/[^a-zA-Z0-9]/g, '')    
  }

}

if (Utils.defineComponent("micro-plugin", Loan)) {
  Utils.addStyleSheet("micro-plugin-spinnerstylesheet", styles);
}
