import State from "../states/State";
import { insertAfter, insertBefore } from "../utils/DOM";
import StateLink from "./StateLink";
import { destory as destroyLinks, LoopSetupInput, setup } from "../LinkStateJS";
import MutableState from "../states/MutableState";

export default class LoopLink implements StateLink {

    private element: Element;
    private itemName: string;
    private state: State<Iterable<any>>;
    private parentStates: Object;
    private foreachSetup: ((state: LoopSetupInput) => Object | undefined) | undefined;

    private template: Element;
    private loopInstances: Map<Element, StateLink[]>;
    private forComment: Comment;

    constructor(
        element: Element,
        itemName: string,
        state: State<Iterable<any>>,
        parentStates: Object,
        foreachSetup: ((state: LoopSetupInput) => Object | undefined) | undefined) {
        this.element = element;
        this.itemName = itemName;
        this.state = state;
        this.parentStates = parentStates;
        this.foreachSetup = foreachSetup;

        this.template = this.element.cloneNode(true) as Element;
        this.loopInstances = new Map();
        this.forComment = document.createComment("link-state-js-for");
        insertBefore(this.forComment, element);

        this.element.remove();
        this.update();
    }

    update(): void {
        this.resetLoop();
        this.insertLoopChildren();
    }

    private resetLoop(): void {
        for (const [element, links] of this.loopInstances.entries()) {
            element.remove();
            destroyLinks(...links);
        }
        this.loopInstances.clear();
    }

    private insertLoopChildren(): void {
        const stateAsArray = Array.from(this.state.value);
        for (let i = stateAsArray.length - 1; i >= 0; i--) {
            const loopValue: any = stateAsArray[i];
            const loopElement: Element = this.template.cloneNode(true) as Element;

            const links = setup({
                element: loopElement, setupFunction: () => {
                    const loopState = {};
                    for (const key of Object.keys(this.parentStates)) {
                        // @ts-ignore
                        loopState[key] = this.parentStates[key];
                    }
                    // @ts-ignore
                    loopState[this.itemName] = new MutableState(loopValue);
                    // @ts-ignore
                    loopState["_index"] = new MutableState(i);

                    if (this.foreachSetup) {
                        const foreachSetupState = this.foreachSetup({ element: loopElement, states: loopState }) || {};
                        for (const key of Object.keys(foreachSetupState)) {
                            // @ts-ignore
                            loopState[key] = foreachSetupState[key];
                        }
                    }

                    return loopState;
                }
            });

            insertAfter(loopElement, this.forComment);
            this.loopInstances.set(loopElement, links);
        }
    }

    destroy(): void {
        this.state.unsubscribe(this);
        this.forComment.remove();
    }

}