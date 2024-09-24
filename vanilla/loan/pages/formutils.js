export class FormHelper {

    #checkBoxes;
    #inputs;

    constructor(container) {
        this.#checkBoxes = container.querySelectorAll("checkbox-component");
        this.#inputs = container.querySelectorAll("input[type='text']");

        console.log("===============");
        console.log("checkboxes", this.#checkBoxes);
        console.log("inputs", this.#inputs);

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
        for (const ip of this.#inputs) {
            pos++;
            const propName = ip.getAttribute("name") || "input_" + pos;
            result[propName] = ip.value ?? "";
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
        for (const ip of this.#inputs) {
            pos++;
            const propName = ip.getAttribute("name") || "input_" + pos;
            ip.value = state[propName] ?? "";
        }
    }

}