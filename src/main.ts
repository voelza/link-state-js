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
    const color2 = state("#f7f7f7");
    const color3 = state("#000000");
    textState({ selector: "#colorDisplay", state: color });
    attribute({ selector: ".app", name: "style", value: () => `background-color: ${color.value};`, states: [color] });

    const log = () => {
        console.log("eyo");
    };

    const height = state(5);
    const width = state(1);
    return { username, password, submit, color, showResult, log, color2, color3, height, width };
};

setup({ selector: "#app", setupFunction: s });
// setup({ selector: "#app2", setupFunction: s });
autoLink({ selector: "#app2", states: { s } });