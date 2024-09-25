export class FormHelper {

    #checkBoxes;
    #textInputs;
    #dropDowns;

    constructor(container) {
        this.#checkBoxes = container.querySelectorAll("checkbox-component");
        this.#textInputs = container.querySelectorAll("input[type='text']");
        this.#dropDowns = container.querySelectorAll("select");
    }

    getValues(state) {
        const result = state ?? {};
        let pos = 0;
        for (const chk of this.#checkBoxes) {
            pos++;
            const propName = chk.getAttribute("name") || "chk_" + pos;
            result[propName] = chk.checked ?? false;
        }

        pos = 0;
        for (const ip of this.#textInputs) {
            pos++;
            const propName = ip.getAttribute("name") || "input_" + pos;
            result[propName] = ip.value ?? "";
        }

        pos = 0;
        for (const dp of this.#dropDowns) {
            pos++;
            const propName = dp.getAttribute("name") || "select_" + pos;
            result[propName] = dp.value;
            result[propName + "_text" ] = dp.options[dp.selectedIndex].text;
        }

        return result;
    }

    setValues(state) {
        state ??= {};
        let pos = 0;
        for (const chk of this.#checkBoxes) {
            pos++;
            const propName = chk.getAttribute("name") || "chk_" + pos;
            chk.checked = !!state[propName];
        }

        pos = 0;
        for (const ip of this.#textInputs) {
            pos++;
            const propName = ip.getAttribute("name") || "input_" + pos;
            ip.value = state[propName] ?? "";
        }
    }

}