export class Utils {

    static create(type, text, ...attribs) {
        const el = document.createElement(type);
        if (text) {
        el.innerText = text;
        }
        if (attribs.length > 0) {
        for (var i = 0; i < attribs.length; i+=2) {
            if (typeof attribs[i+1] === "function") {
                el.addEventListener(attribs[i], attribs[i+1]);
            } else {
                el.setAttribute(attribs[i], attribs[i+1]);
            }
        }
        }
        return el;
    }

    static trimLeadingLineBreaks(value) {
        if (value && value.startsWith("\n")) 
        return this.trimLeadingLineBreaks(value.substring(1));
        return value;
    }

    static addStyleSheet(name, css) {
        if (name && document.getElementById(name)) {
            return;
        }
        var style = document.createElement("style");
        if (name) style.setAttribute("ID", name);
        style.innerText = css;
        document.getElementsByTagName("body")[0].appendChild(style);    
    }

    /**
     * Calls the customeElements.define function with try/catch block
     * Returns true if successfull
     * @param {string} name 
     * @param {class} implementation 
     */
    static defineComponent(name, implementation) {
        try {
            customElements.define(name, implementation);
            return true;
        } catch (err) {
            console.log(err);
        }
        return false;
    }

}
