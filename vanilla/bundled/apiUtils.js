export class ApiUtils {

    static setValue(obj, prop, value) {
        const subIx = prop.indexOf(".");
        if (subIx > 0) {
            const p1 = prop.substring(0, subIx);
            obj[p1] = obj[p1] || { _createguid: this.createGuid() };
            this.setValue(obj[p1], prop.substring(subIx + 1), value);
            return;
        }
        obj[prop] = value;
    }

    static getValue(object, name) {
        const ixDot = name.indexOf(".");
        if (ixDot > 0) {
            const child = name.substring(0, ixDot);
            if (object[child]) {
                return this.getValue(object[child], name.substring(ixDot + 1));
            }
        }
        return object[name];
    }

    static createGuid() {
        return(""+1e7+-1e3+-4e3+-8e3+-1e11).replace(/1|0/g,function(){return(0|Math.random()*16).toString(16)});
    }

    static formatMoney(value) {
        return Intl.NumberFormat("nb-NO", { style: 'currency', currency: "NOK"}).format((value));
    }

    static newEntity(...props) {
        const ent = { _createguid: this.createGuid() };
        props.forEach( p => ent[p] = "");
        return ent;
    }

    static toast(msg) {
        var x = document.getElementById("toast");
        x.innerText = msg;
        x.className = "show";
        setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
    }

    static positionRelativeTo(popup, relativeTo) {
        const rect = relativeTo.getBoundingClientRect();
        const popupRect = popup.getBoundingClientRect();
        if (popupRect.width > window.innerWidth) {
            popup.style.width = window.innerWidth + "px";
            popupRect.width = window.innerWidth;
        }
        let yPosition = relativeTo.offsetTop + relativeTo.offsetParent.offsetTop;
        let xPosition = relativeTo.offsetLeft + relativeTo.offsetParent.offsetLeft;
        yPosition += rect.height;
        // Outside window ?
        if (yPosition + popupRect.height > window.innerHeight) {
            yPosition = relativeTo.offsetTop + relativeTo.offsetParent.offsetTop - popupRect.height;
            if (yPosition < 0) yPosition = 0;
        }
        if (xPosition + popupRect.width > window.innerWidth) {
            xPosition = relativeTo.offsetLeft + relativeTo.offsetParent.offsetLeft - popupRect.width;
            if (xPosition < 0) xPosition = 0;
        }
        popup.style.position = "absolute";
        popup.style.left = xPosition + "px";
        popup.style.top = yPosition + "px";
    }

    static async loadHtml(htmlRelativeUrl, baseUrl) {
        const htmlUrl = new URL(htmlRelativeUrl, baseUrl).href;
        return await fetch(htmlUrl).then(response => response.text());
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
        date.setMinutes(0);
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
        const parsed = Utils.parseMinutes(value);
        switch (format) {
            case 'short':
                return Utils.shortFmt(parsed);
            case 'decimal00':
                return !!value ? parsed.decimal.toFixed(2) : '';
            case 'int':
                return !!value ? parsed.decimal.toFixed(0) : '';
            case 'money2':
                return !!value ? parsed.decimal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '';
            case 'money':
                return !!value ? parsed.decimal.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0}) : '';
            default:
                return Utils.longFmt(parsed);
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