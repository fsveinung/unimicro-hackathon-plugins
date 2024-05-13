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
     * @param {string} bizEntity 
     * @param {number} id 
     */
    async get(bizEntity, id) {
        const route = `/api/biz/${bizEntity}/${id}`;
        return await this._api.get(route);
    }

    /**
     * Returns a single object
     * @param {string} bizEntity 
     */
    async first(bizEntity) {
        const route = `/api/biz/${bizEntity}`
            + `${this.urlSeparator(bizEntity)}top=1`;
        const result = await this._api.get(route);
        return Array.isArray(result) && result.length > 0 ? result[0] : undefined;
    }    

    /**
     * Returns a list of objects based on route
     * @param {string} bizEntity 
     */
    async getAll(bizEntity) {
        const route = `/api/biz/${bizEntity}`;
        return await this._api.get(route);
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