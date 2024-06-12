export class EventMap {
    
    #eventMap = new Map();

    /**
     * Register new eventhandler
     * @param {string} name 
     * @param {function} callBack 
     */
    on(name, callBack) {
        const list = this.#eventMap.get(name) ?? [];
        list.push(callBack);
        this.#eventMap.set(name, list);
    }
    
    /**
     * Will try to call given callback if registered
     * @param {string} name - eventname
     * @param {any} cargo - event-parameter
     * @returns {true | false}
     */
    raiseEvent(name, cargo) {
        if (this.#eventMap.has(name)) {
            const list = this.#eventMap.get(name);
            let result;
            for (const handler of list)
                result = handler(cargo);
            return result;
        }
        return true;
    }

}