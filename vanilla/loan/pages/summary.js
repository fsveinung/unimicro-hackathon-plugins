import { Utils } from "../../libs/utils.js";
import { summary_template } from "./summary.html";

export class SummaryPage {
  
    /** @type {HTMLElement} */
    #companyFragment;

    #fragments = {
        company: undefined,
        purpose: undefined,
        security: undefined,
        total: undefined
    };

  create() {
    const fragment = Utils.createFromTemplate(summary_template);
    this.#fragments.company = fragment.querySelector("#company-card");
    this.#fragments.purpose = fragment.querySelector("#loan-purpose");
    this.#fragments.equity = fragment.querySelector("#loan-equity");
    this.#fragments.total = fragment.querySelector("#loan-total");
    return fragment;
  }

  async activate(state, appService) {
    this.#showCompanyInfo(appService);
    this.#showStateInfo(state);
  }  

  validate(state) {
    return { success: true, state: state };
  }

  async #showCompanyInfo(appService) {
    const data = await appService.http.get('/api/biz/companysettings/1?select=CompanyName,OrganizationNumber');
    this.#fragments.company.innerHTML = `
    <ul>
        <li>${data.CompanyName}</li>
        <li>Organisasjonsnr: ${data.OrganizationNumber}</li>
    </ul>
    `;    
  }

  #showStateInfo(state) {
    var fmt = new Intl.NumberFormat();
    this.#fragments.purpose.innerHTML = `<ul><li>${state.purpose_text}</li></ul>`;
    this.#fragments.equity.innerHTML = `<ul><li>${fmt.format(state.equity)}</li></ul>`;
    this.#fragments.total.innerHTML = `<ul><li>${fmt.format(state.amount + state.equity)}</li></ul>`;
  }



}
