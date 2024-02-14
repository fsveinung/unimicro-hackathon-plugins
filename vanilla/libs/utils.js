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

    /**
     * Creates html from a template and adds eventhandlers
     * for each "ID" found inside the template.
     * example:
     * createFromTemplate("<button id='mybtn'>clickme</button>", "mybtn:click", () => alert("hi"))
     * @param {string} html
     * @param  {...any} handlers
     * @returns
     */
    static createFromTemplate(html, ...handlers) {
        const template = document.createElement("template");
        template.innerHTML = html;
        const element = template.content.cloneNode(true);
        if (handlers.length > 0) {
            console.log("eventhandlers:" + handlers.length / 2);
            for (var i = 0; i < handlers.length; i += 2) {
                if (typeof handlers[i+1] === "function") {
                    var parts = handlers[i].split(":");
                    let event = parts.length > 1 ? parts[1] : "click";
                    const target = element.getElementById(parts[0]);
                    if (target) {
                        target.addEventListener(event, handlers[i+1]);
                    }
                }
            }
        }
        return element;
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

    static removeChildren(htmlNode) {
        if (htmlNode)
            while (htmlNode.firstChild)
                htmlNode.removeChild(htmlNode.firstChild);
    }

    static hide(element, hide) {
        if (element) {
            element.hidden = !!hide;
        }
    }

}
