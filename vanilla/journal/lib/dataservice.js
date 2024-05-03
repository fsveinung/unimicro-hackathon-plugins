export class DataService {

    _api;

    /**
     * Constructor
     * @param {Api} api 
     */
    constructor(api) {
        this._api = api;
    }

    /**
     * Returns a single object
     * @param {string} bizRoute 
     * @param {number} id 
     */
    async get(bizRoute, id) {

    }

    /**
     * Returns a single object
     * @param {string} bizRoute 
     */
    async first(bizRoute) {
        const route = `/api/biz/${bizRoute}`
            + `${this.urlSeparator(bizRoute)}top=1`;
        const result = this._api.get(route);
        return result && result.length > 0 ? result[0] : undefined;
    }    

    /**
     * Returns a list of objects based on route
     * @param {string} bizRoute 
     */
    async getAll(bizRoute) {
        const route = `/api/biz/${bizRoute}`;
        return this._api.get(route);
    }


    /**
     * Checks which separator to use if bizroute already has ?
     * @param {string} bizRoute 
     * @returns {string} either ? or & 
     */
    urlSeparator(bizRoute) {
        return bizRoute.indexOf('?')>0 ? '&' : '?';
    }
}