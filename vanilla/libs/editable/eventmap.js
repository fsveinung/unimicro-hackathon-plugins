export class EventMap {
    
    #eventMap = new Map();

    /**
     * Register new eventhandler
     * @param {string} name 
     * @param {function} callBack 
     */
    on(name, callBack) {
        this.#eventMap.set(name, callBack);
    }
    
    /**
     * Will try to call given callback if registered
     * @param {string} name - eventname
     * @param {any} cargo - event-parameter
     * @returns {true | false}
     */
    raiseEvent(name, cargo) {
        if (this.#eventMap.has(name)) {
            const handler = this.#eventMap.get(name);
            return handler(cargo);
        }
        return true;
    }

}