import State from "../states/State";
import StateLink from "./StateLink";

export default class TextLink implements StateLink {

    private element: Element;
    private valueFunction: () => string;
    private states: State<any>[];

    constructor(element: Element, valueFunction: () => string, states: State<any>[]) {
        this.element = element;
        this.valueFunction = valueFunction;
        this.states = states;
        this.update();
    }

    update(): void {
        const value = this.valueFunction();
        this.element.textContent = value;
    }

    destroy(): void {
        for (const s of this.states) {
            s.unsubscribe(this);
        }
    }

}