import { DataService } from "../../libs/dataservice.js";

export class JournalSession {

    _dataService;
    _settings;
    _vatTypes;
    _rows = [];
    _columns = new Map();

    get rows() {
        return this._rows;
    }

    get columns() {
        if (this._columns.size === 0) this._columns = this.setupColumns();
        return this._columns;
    }    

    constructor(dataService) {
        this._dataService = dataService;
    }

    /**
     * Initializes the session
     * Ensures that all dependencies are fetched (settings etc.)
     */
    async initialize() {
        this._settings = await this._dataService.first("companysettings");
        console.log(this._settings);
        // this._accounts = await this._dataService.getAll("accounts?filter=toplevelaccountgroupid gt 0 and isnull(visible,0) eq 1");
        // console.table(this._accounts);
        this._vatTypes = await this._dataService.getAll("vattypes");
        //console.table(this._vatTypes);
    }

    setupColumns() {
        const map = new Map();
        map.set("FinancialDate", { name: "FinancialDate", label: "Dato", type: "date" });
        map.set("DebitAccount", { name: "DebitAccount", label: "Debet", type: "account" });
        map.set("CreditAccount", { name: "CreditAccount", label: "Kredit", type: "account" });
        map.set("Amount", { name: "Amount", label: "Beløp", type: "money" });
        map.set("Description", { name: "Description", label: "Tekst", type: "string" });
        return map;
    }

    addRow() {
        const row = {};
        this._rows.push(row);
        return row;
    }

}