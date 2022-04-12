import State from "../states/State";
import StateLink from "./StateLink";

const booleanAttributes = ["allowfullscreen",
    "allowpaymentrequest",
    "async",
    "autofocus",
    "autoplay",
    "checked",
    "controls",
    "default",
    "defer",
    "disabled",
    "formnovalidate",
    "hidden",
    "ismap",
    "itemscope",
    "loop",
    "multiple",
    "muted",
    "nomodule",
    "novalidate",
    "open",
    "playsinline",
    "readonly",
    "required",
    "reversed",
    "selected",
    "truespeed"]

export default class AttributeLink implements StateLink {

    private element: Element;
    private attributeName: string;
    private valueFunction: () => string;
    private states: State<any>[];
    private staticValue: string;
    private isBooleanAttribute: boolean;

    constructor(element: Element, attributeName: string, valueFunction: () => string, states: State<any>[]) {
        this.element = element;
        this.attributeName = attributeName;
        this.valueFunction = valueFunction;
        this.states = states;

        this.staticValue = element.getAttribute(this.attributeName) ?? "";
        this.isBooleanAttribute = booleanAttributes.includes(this.attributeName);

        this.update();
    }

    update(): void {
        this.element.removeAttribute(this.attributeName);
        const value = this.valueFunction();
        if (!this.isBooleanAttribute || value) {
            this.element.setAttribute(this.attributeName, this.staticValue ? [this.staticValue, value].join(" ") : value);
        }
    }

    destroy(): void {
        for (const s of this.states) {
            s.unsubscribe(this);
        }
    }

}