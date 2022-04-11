import StateLink from "./StateLink";

export default class EventListenerLink implements StateLink {

    private element: Element;
    private eventName: string;
    private listener: (event: any) => void

    constructor(element: Element, eventName: string, listener: (event: any) => void) {
        this.element = element;
        this.eventName = eventName;
        this.listener = listener;

        this.element.addEventListener(this.eventName, this.listener);
    }

    update(): void {
        throw new Error("Method not implemented.");
    }

    destroy(): void {
        this.element.removeEventListener(this.eventName, this.listener);
    }

}