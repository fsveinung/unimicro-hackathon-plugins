export class Dates {

    /**
     * Tries to parse date-input
     * @param {any} value 
     * @param {boolean} allowMacros 
     * @returns {Date | undefined } - A valid date or undefined if invalid
     */
    static parseDate(value, allowMacros = true) {
        const today = new Date();

        if (value === null) { return; }
    
        if (typeof value === 'object' && value.getMonth) {
            return value;
        }
    
        if (allowMacros) {
            if (value === '*') { return new Date(); }
        }
    
        var dividers = ['/', ',', '.'];
        for (const d of dividers) {
            if (value.indexOf(d) > 0) {
                const parts = value.split(d);
                if (parts.length < 2) continue;
                debugger;
                const dParts = parts.map( txt => parseInt(txt) );
                switch (parts.length) {
                    case 2:
                        if (dParts[0] > 0 && dParts[1] > 0) {
                            return new Date( today.getFullYear(), dParts[1] - 1, dParts[0]);
                        }
                        break;
                    case 3:
                        if (dParts[0] > 0 && dParts[1] > 0) {
                            let y = dParts[2];
                            if (y < 100) { if (y < 40) y += 2000; else y += 1900; } 
                            return new Date( y, dParts[1] - 1, dParts[0]);
                        }                        
                        break;
                }
            }
        }
    
        let d = parseInt(value);
        let m = today.getMonth() + 1;
        let y = today.getFullYear();
        if (d > 0) {
            switch (value.length) {
                case 1:
                case 2:
                    break;
                case 3: // 133 = 13.3, 205 = 20.5, 305 = 30.5
                    d = parseInt(value.substr(0, 1));
                    if (d > 3) {
                        m = parseInt(value.substr(1));
                    } else {
                        d = parseInt(value.substr(0, 2));
                        m = parseInt(value.substr(2));
                    }
                    break;
                case 4:
                    d = parseInt(value.substr(0, 2));
                    m = parseInt(value.substr(2, 2));
                    break;
                case 6:
                    d = parseInt(value.substr(0, 2));
                    m = parseInt(value.substr(2, 2));
                    y = parseInt(value.substr(4, 2));
                    if (y < 40) y += 2000; else y += 1900;
                    break;
            }
            
            return new Date(y, m - 1, d);
        }
    
    
    }

}