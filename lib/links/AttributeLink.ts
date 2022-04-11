import State from "../states/State";
import StateLink from "./StateLink";

export default class AttributeLink implements StateLink {

    private element: Element;
    private attributeName: string;
    private valueFunction: () => string;
    private states: State<any>[];
    private staticValue: string;

    constructor(element: Element, attributeName: string, valueFunction: () => string, states: State<any>[]) {
        this.element = element;
        this.attributeName = attributeName;
        this.valueFunction = valueFunction;
        this.states = states;

        this.staticValue = element.getAttribute(this.attributeName) ?? "";

        this.update();
    }

    update(): void {
        const value = this.valueFunction();
        this.element.setAttribute(this.attributeName, this.staticValue ? [this.staticValue, value].join(" ") : value);
    }

    destroy(): void {
        for (const s of this.states) {
            s.unsubscribe(this);
        }
    }

}