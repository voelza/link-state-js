import State from "../states/State";
import { insertAfter, insertBefore } from "../utils/DOM";
import StateLink from "./StateLink";

export default class RenderLink implements StateLink {

    private element: Element;
    private condition: () => boolean;
    private states: State<any>[];
    private ifComment: Comment;
    private isElementRendered: boolean | undefined;

    constructor(element: Element, condition: () => boolean, states: State<any>[]) {
        this.element = element;
        this.condition = condition;
        this.states = states;

        this.ifComment = document.createComment("state-dom-js-if");
        insertBefore(this.ifComment, element);
        this.update();
    }

    update(): void {
        const result: boolean = this.condition();
        if (result) {
            if (!this.isElementRendered || this.isElementRendered === undefined) {
                this.isElementRendered = result;
                insertAfter(this.element, this.ifComment);
            }
        } else {
            if (this.isElementRendered || this.isElementRendered === undefined) {
                this.isElementRendered = result;
                this.element.remove();
            }
        }

    }

    destroy(): void {
        for (const s of this.states) {
            s.unsubscribe(this);
        }
    }

}