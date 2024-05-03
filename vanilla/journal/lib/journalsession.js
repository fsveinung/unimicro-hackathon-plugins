export class JournalSession {

    _dataService;
    _settings;
    _vatTypes;
    _rows = [];

    get rows() {
        return this._rows;
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

    addRow() {
        const row = {};
        this._rows.push(row);
        return row;
    }

}