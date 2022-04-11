import { autoLink, state } from "../../../../lib/LinkStateJS";
import State from "../../../../lib/states/State";

const counterSetup = () => {
    const count: State<number> = state(0);
    const counter = () => {
        count.value++;
    }
    return {
        count, counter
    }
};

autoLink({ selector: "body", states: { counterSetup } });