export class Api {

    _http;
    _errHandler;

    constructor(http, errHandler) {

        this._http = http;
        this._errHandler = errHandler;
    }

    handleErr(err) {
        console.error(err);
        if (this._errHandler) {
            this._errHandler(err);
        }
    }

    async get(route) {
        return new Promise( async (resolve, reject) => {
            try {
                const result = await this._http.get(route);
                resolve(result);
            } catch (err) {
                this.handleErr(err);
                reject(err);
            }
        });
    }

    async post(route, object) {
        return new Promise( async (resolve, reject) => {
            try {
                const result = await this._http.post(route, object);
                resolve(result);
            } catch (err) {
                this.handleErr(err);
                reject(err);
            }
        });
    }    

    async put(route, object) {
        return new Promise( async (resolve, reject) => {
            try {
                const result = await this._http.put(route, object);
                resolve(result);
            } catch (err) {
                this.handleErr(err);
                reject(err);
            }
        });
    }    
 
}