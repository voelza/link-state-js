import { autoLink, state } from "../../../../lib/LinkStateJS";
import State from "../../../../lib/states/State";

const count: State<number> = state(0);
const counter = () => {
    count.value++;
}

autoLink({ selector: "body", states: { count, counter } });