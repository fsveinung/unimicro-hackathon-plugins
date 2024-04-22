import { template } from './template.html';
import { styles } from './style.css';
import { Utils } from '../libs/utils.js';

class Plugin extends HTMLElement {

    _pluginApi;

    constructor() {
        super();
    }

    set api(pluginApi) {
        this._pluginApi = pluginApi;
        this.updateUserInterface();
    }

    connectedCallback() {
        this.updateUserInterface();
    }
 
    updateUserInterface() {
        if (this.ownerDocument.defaultView) {
          if (this.childNodes.length == 0) {
            this.createContent();
          } else {
            this.updateContent();
          }
        }
      }
    
      createContent() {
        this.appendChild(
          Utils.createFromTemplate(template,
            "btnHelp:click", () => this.help()
          )
        );
      }    

      help() {
        this._pluginApi.showAlert("Help is on the way!!");
      }   
      
      async updateContent() {
        if (this._pluginApi) {
            this._company = await this._pluginApi.http.get('/api/biz/companysettings/1?select=CompanyName');
        }
      }      

}

if (Utils.defineComponent("plugin-component", Plugin)) {
    Utils.addStyleSheet("plugin-component-styles", styles);
}