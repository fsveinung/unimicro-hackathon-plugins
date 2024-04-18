import { Utils } from "../libs/utils.js";
import { template } from "./loan.html";
import { styles } from "./style.css";

class Loan extends HTMLElement {

  _api = null;
  _company = null;
  _wizard = undefined;
  _steps = [
    { label: "Steg 1", value: "page1", ref: undefined },
    { label: "Steg 2", value: "page2", ref: undefined },
    { label: "Steg 3", value: "page3", ref: undefined },
  ];


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
            step.ref.classList.remove("hidden");
        } else {
            step.ref.classList.add("hidden");
        }
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
