import { listener, state, text } from "../../../../lib/LinkStateJS";
import State from "../../../../lib/states/State";

const count: State<number> = state(0);
const counter = () => {
    count.value++;
}

text({ element: document.getElementById("count")!, text: () => `${count.value}`, states: [count] });
listener({ element: document.getElementById("counter")!, trigger: "click", listener: counter });