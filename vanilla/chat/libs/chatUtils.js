export class ChatUtils {

    static createGuid() {
        return(""+1e7+-1e3+-4e3+-8e3+-1e11).replace(/1|0/g,function(){return(0|Math.random()*16).toString(16)});
    }

    static formatMoney(value) {
        return Intl.NumberFormat("nb-NO", { style: 'currency', currency: "NOK"}).format((value));
    }

    static getFuzzy(object, property) {
        if (object === undefined) return "";
        if (object[property]) return object[property];
        for (var i in object) {
            if (property == i.toLowerCase()) {
                return object[i];
            }
        }
        if (arguments.length > 2 && !!arguments[2]) {
            const next = arguments[2];
            const range = [];
            for (var i = 3; i < arguments.length; i++ ) {
                range.push(arguments[i]);
            }
            return range.length > 0 ? this.getFuzzy(object, next, ...range) : this.getFuzzy(object, next);
        }
    }

    /**
     * Tries to parse hours and minutes into a decimal value: 08:30 -> 8.5
     * @param {string} textValue 
     * @returns {number}
     */
    static parseTime(textValue) {
        if (!(textValue && textValue.length > 0)) return 0;
        const parts = textValue.split(":");
        if (parts.length === 2) {
            return parseInt(parts[0]) + parseInt(parts[1]) / 60;
        }
        if (parts.length === 1) {
            return parseInt(parts[0]);
        }
    }

    static textEquals(v1, v2) {
        if (typeof v1 === "string" && typeof v2 === "string") {
            return v1.trim().toLowerCase() === v2.trim().toLowerCase();
        }
        return v1 === undefined && v2 === undefined;
    }

    static formatDate(date) {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2)
            month = '0' + month;
        if (day.length < 2)
            day = '0' + day;

        return [year, month, day].join('-');
    }

    static formatTime(date, hour) {
        let minutes = 0;
        if (hour % 1 !== 0) {
            minutes = (hour % 1) * 60;
        }
        date.setMinutes(minutes);
        date.setSeconds(0);
        date.setHours(hour);
        try {
            return date.toISOString();
        } catch (err) {
            console.log('error parsing in formatTime',err);
            return "";
        }
    }

    static minutesToHours(value, format) {
        const parsed = ChatUtils.parseMinutes(value);
        switch (format) {
            case 'short':
                return ChatUtils.shortFmt(parsed);
            case 'decimal00':
                return !!value ? parsed.decimal.toFixed(2) : '';
            case 'int':
                return !!value ? parsed.decimal.toFixed(0) : '';
            case 'money2':
                return !!value ? parsed.decimal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '';
            case 'money':
                return !!value ? parsed.decimal.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0}) : '';
            default:
                return ChatUtils.longFmt(parsed);
        }
    }

    static parseMinutes(value) {
        var defaultValue = { hours: 0, minutes: 0, preSign: '', decimal: 0 };
        if (value === null) { return  defaultValue; }
        if (!value) { return defaultValue; }
        var hours = 0;
        var minutes = parseInt(value);
        var dec = parseFloat((minutes / 60).toFixed(1));
        var preSign = '';
        if (minutes < 0) {
            minutes = -minutes;
            preSign = '-';
        }
        if (minutes === 0) { return defaultValue; }
        if (minutes >= 60) {
            hours = Math.floor(minutes / 60);
            minutes = minutes % 60;
        }
        return { hours: hours, minutes: minutes, preSign: preSign, decimal: dec };
    }

    static longFmt(time) {
        return time.preSign + (time.hours > 0 ? time.hours + ' timer ' : '')
            + (time.minutes !== 0 ? (time.hours > 0 ? ' og ' : '') + time.minutes + ' minutter' : '');
    }

    static shortFmt(time) {
        if (time.hours === 0 && time.minutes === 0) { return ''; }
        return time.preSign + time.hours + ' : ' + (time.minutes < 10 ? '0' : '') + time.minutes;
    }

}