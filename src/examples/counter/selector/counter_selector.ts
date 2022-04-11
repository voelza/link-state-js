import { listener, state, text } from "../../../../lib/LinkStateJS";
import State from "../../../../lib/states/State";

const count: State<number> = state(0);
const counter = () => {
    count.value++;
}

text({ selector: "#count", text: () => `${count.value}`, states: [count] });
listener({ selector: "#counter", trigger: "click", listener: counter });