import { autoLink, state } from "../../../../lib/LinkStateJS";



const counter = state(0);
const increaseCounter = () => {
    counter.value++;
};

autoLink({ selector: "#app", states: { counter, increaseCounter } });