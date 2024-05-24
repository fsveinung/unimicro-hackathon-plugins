import { Utils } from "../libs/utils.js";
import { template } from "./loan.html";
import { styles } from "./style.css";
import { Table } from "../libs/editable/table.js";

class Loan extends HTMLElement {

  _api = null;
  _company = null;
  _wizard = undefined;
  _steps = [
    { label: "Om finansieringen", value: "page1", ref: undefined },
    { label: "Sikkerhet", value: "page2", ref: undefined },
    { label: "Fremtidige inntekter", value: "page3", ref: undefined}    
  ];
  
  /** Table property reference
   * @type {Table}
   * @private
  */
  _incomeTable;

  constructor() {
    super();
  }

  connectedCallback() {
    this.updateUserInterface();
  }

  set api(v) {
    this._api = v;
    this.updateUserInterface();
  }

  updateUserInterface() {
    if (this.ownerDocument.defaultView) {
      if (this.childNodes.length == 0) {
        this.createContent();
        setTimeout(() => { this.setupWizard(); }, 0);
      } else {
        this.updateContent();
      }
    }
  }

  createContent() {
    this.appendChild(
      Utils.createFromTemplate(template,
        "btnHelp:click", () => this.help(),
        "bntBack:click", () => this.moveBack(),
        "btnNext:click", () => this.moveNext()
      )
    );
    this.showPage("page1");
  }

  setupWizard() {
    if (!this._api?.factory) { console.log("No factory"); return; }
    this._wizard = this._api.factory.create("rig-wizard", [undefined, this] );
    if (this._wizard?.instance) {
      const wiz = this._wizard.instance;
      wiz.steps = this._steps;
      wiz.activeStepValue = "page1";
      wiz.ngOnChanges();
      wiz.refresh();
    }
  }

  moveNext() {
    const wiz = this._wizard?.instance;
    if (wiz && wiz.activeIndex < wiz.steps.length - 1) {
      wiz.activeStepValue = wiz.steps[wiz.activeIndex + 1].value;
      this.showPage(wiz.activeStepValue);
      wiz.ngOnChanges();
      wiz.refresh();
    }
  }

  moveBack() {
    const wiz = this._wizard?.instance;
    if (wiz && wiz.activeIndex > 0) {
      wiz.activeStepValue = wiz.steps[wiz.activeIndex - 1].value;
      this.showPage(wiz.activeStepValue);
      wiz.ngOnChanges();
      wiz.refresh();
    }
  }

  help() {
    this._api.showAlert("Help is on the way!!");
  }

  showPage(stepValue) {
    let index = 0;
    for (let step of this._steps) {
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
      if (!this._incomeTable) {
        const tbl = step.ref.querySelector("#future-incomes");
        if (!tbl) { console.error("Could not find the table!"); return; }
        this._incomeTable = new Table();
        const map = new Map();
        map.set("source", { name: "source", label: "Kilde", type: "account" });
        map.set("amount", { name: "amount", label: "Beløp", type: "money" });
        this._incomeTable.setup( map, true, tbl );
        this._incomeTable.addRows(5);
      }
      setTimeout(() => { this._incomeTable?.focus(true); }, 100);    
    }
  }

  async updateContent() {
    if (this._api) {
        this._company = await this._api.http.get('/api/biz/companysettings/1?select=CompanyName');
    }
  }


}

if (Utils.defineComponent("micro-plugin", Loan)) {
  Utils.addStyleSheet("micro-plugin-spinnerstylesheet", styles);
}
