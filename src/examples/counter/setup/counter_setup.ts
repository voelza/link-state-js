import { setup, state } from "../../../../lib/LinkStateJS";
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

setup({ selector: "#counter1", setupFunction: counterSetup });
setup({ selector: "#counter2", setupFunction: counterSetup });