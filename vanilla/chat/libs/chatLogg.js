export class ChatLog {

    _logg = [];
    _cursor = -1;

    getLength() {
        return this._logg.length;
    }

    getLogg() {
        return this._logg;
    }

    add(msg) {
        this._logg.push(msg);
        this._cursor = this._logg.length;
    }

    moveBack() {
        if (this._cursor <= 0) {
            this._cursor = this._logg.length;
        }
        this._cursor--;
        return this._logg[this._cursor];
    }

    moveNext() {
        if (this._cursor >= this._logg.length - 1) {
            this._cursor = -1;
        }
        this._cursor++;
        return this._logg[this._cursor];
    }

    getLastElement() {
        if (this._logg.length > 0) {
            return this._logg[this._logg.length - 1];
        }
    }

    save(name) {
        localStorage.setItem(name, JSON.stringify(this._logg));
    }

    load(name) {
        const json = localStorage.getItem(name);
        if (json) {
            const logg = JSON.parse(json);
            if (logg && logg.length > 0) {
                this._logg = logg;
            }
        }
    }

    clear() {
        this._logg = [];
    }

}