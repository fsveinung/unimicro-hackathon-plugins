export class ChatLog {

    _logg = [];
    _cursor = -1;

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

}