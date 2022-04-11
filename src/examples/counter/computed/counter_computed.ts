import { computed, listener, rendered, state, text, textState } from "../../../../lib/LinkStateJS";
import State from "../../../../lib/states/State";

const count: State<number> = state(0);
const countDoubled: State<number> = computed(() => count.value * 2, count);
const counter = () => {
    count.value++;
}

textState({ selector: "#count", state: count });
rendered({ selector: "#high", condition: () => count.value > 10, states: [count] });
text({ element: document.getElementById("countDoubled")!, text: () => `* 2 = ${countDoubled.value}`, states: [countDoubled] });
listener({ element: document.getElementById("counter")!, trigger: "click", listener: counter });
