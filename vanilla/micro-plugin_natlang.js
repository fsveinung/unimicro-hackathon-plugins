class MicroPlugin extends HTMLElement {
  constructor() {
    super();
    this._api = null;
    this._company = null;
    this._title = "Loan";
    this._wizard = undefined;
    this._steps = [
      { label: "Om finansieringen", value: "page1", ref: undefined },
      { label: "Sikkerhet", value: "page2", ref: undefined },
      { label: "Fremtidige inntekter", value: "page3", ref: undefined}
    ];
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
    const content = this.html("article", undefined, "class", "mb-4", "style", "min-height: 26em");
    content.appendChild(this.setPage("page1", this.createPage1()));
    content.appendChild(this.setPage("page2", this.createPage2()));
    content.appendChild(this.setPage("page3", this.createPage3()));
    this.appendChild(content);
    this.appendChild(this.createFooter());
  }

  setPage(stepName, element) {
    const match = this._steps.find( s => s.value == stepName);
    if (match) match.ref = element;
    return element;
  }

  createPage1() {
    const page = this.html("section", undefined, "id", "page1");
    page.appendChild(this.html("h1", this._title, "id", "plugin-title"));
    page.appendChild(this.html("h2", "Lånebeløp:"));
    page.appendChild(this.html("input", undefined, "type", "text"));
    return page;
  }

  createPage2() {
    const page = this.html("section", undefined, "class", "hidden", "id", "page2");
    page.appendChild(this.html("h1", this._title, "id", "plugin-title"));
    page.appendChild(this.html("h2", "Sikkerhet:"));
    //page.appendChild(this.html("input", undefined, "type", "text"));
    return page;
  }

  createPage3() {
    const page = this.html("section", undefined, "class", "hidden", "id", "page3");
    page.appendChild(this.html("h1", this._title, "id", "plugin-title"));
    page.appendChild(this.html("h2", "Fremtidige inntekter og kostnader"));
    //page.appendChild(this.html("input", undefined, "type", "text"));
    return page;
  }

  createFooter() {
    const footer = this.html("footer", undefined, "class", "mt-4 mb-2 flex");
    footer.appendChild(this.html("button", "Hjelp", "class", "secondary", "click", () => {
        this._api.showAlert("Help is on the way !");
    }));
    footer.appendChild(this.html("button", "Tilbake", "class", "secondary ml-4", "click", () => {
        this.moveBack();
    }));
    footer.appendChild(this.html("button", "Videre", "class", "c2a", "click", () => {
        this.moveNext();
    }));
    return footer;
  }

  setupWizard() {
    if (!this._api?.factory) { console.log("No factory"); return; }
    this._wizard = this._api.factory.create("rig-wizard", this);
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

  showPage(stepValue) {
    for (let step of this._steps) {
      if (step.value == stepValue) {
        step.ref.classList.remove("hidden");
      } else {
        step.ref.classList.add("hidden");
      }
    }
  }

  async updateContent() {
    if (this._api) {
        this._company = await this._api.http.get('/api/biz/companysettings/1?select=CompanyName');
        const title = document.getElementById("plugin-title");
        if (title) {
            title.innerText = `${this._title} for ${this._company.CompanyName}`;
        }
    }
  }

  // Helper to create html-elements
  html(type, text, ...attribs) {
    const el = document.createElement(type);
    if (text) {
      el.innerText = text;
    }
    if (attribs.length > 0) {
      for (var i = 0; i < attribs.length; i+=2) {
        if (typeof attribs[i+1] === "function") {
            el.addEventListener(attribs[i], attribs[i+1]);
        } else {
            el.setAttribute(attribs[i], attribs[i+1]);
        }
      }
    }
    return el;
  }

}

customElements.define("nat-lang", MicroPlugin);