import State from "../states/State";
import { getValue } from "../utils/PathHelper";
import StateLink from "./StateLink";

export default class AttributeLink implements StateLink {

    private element: Element;
    private targetAttribute: string;
    private state: State<any>;
    private statePath: string | undefined;
    private eventListener: (event: any) => void;


    constructor(element: Element, state: State<any>, statePath: string | undefined = undefined) {
        this.element = element;
        this.state = state;

        const dotIndex = statePath?.indexOf(".");
        this.statePath = dotIndex && dotIndex !== -1 ? statePath?.substring(dotIndex + 1) : undefined;

        this.targetAttribute = element.getAttribute("type") === "checkbox" ? "checked" : "value";
        this.eventListener = (event: any) => {
            const target: any | null = event.target;
            if (target) {
                if (this.statePath || !this.state.value) {
                    this.state.value.setValueForPath(this.statePath, target[this.targetAttribute]);
                } else {
                    this.state.value = target[this.targetAttribute];
                }
            }
        }

        this.element.addEventListener("input", this.eventListener);
        this.update();
    }

    update(): void {
        (this.element as any)[this.targetAttribute] = this.state.value?.getValueForPath(this.statePath);
    }

    destroy(): void {
        this.state.unsubscribe(this);
        this.element.removeEventListener("input", this.eventListener);
    }

}