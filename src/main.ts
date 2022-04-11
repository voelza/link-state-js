import { attribute, listener, textState, state, setup, autoLink } from "../lib/LinkStateJS";

const s = () => {
    const username = state("");
    const password = state("");

    const showResult = state(false);
    textState({ selector: "#showResult", state: showResult });


    const submit = () => {
        showResult.value = true;
    };



    listener({
        selector: "#reset",
        trigger: "click",
        listener: () => {
            showResult.value = false;
            username.value = "";
            password.value = "";
        }
    });

    const color = state("#a1dda8");
    textState({ selector: "#colorDisplay", state: color });
    attribute({ selector: ".app", name: "style", value: () => `background-color: ${color.value};`, states: [color] });
    return { username, password, submit, color, showResult };
};

setup({ selector: "#app", setupFunction: s });
// setup({ selector: "#app2", setupFunction: s });
autoLink({ selector: "#app2", states: { s } });