import StateLink from "../links/StateLink";
import State from "./State";


export default class ComputedState<T> implements StateLink, ComputedState<T>, State<T>{
    value: T;
    computer: () => T;
    private parents: State<any>[] = [];

    private subscribers: StateLink[] = [];

    constructor(computer: () => T, parents: State<any>[]) {
        this.computer = computer;
        this.value = this.computer();
        this.parents = parents;
    }

    init(): void {
    }

    update(): void {
        this.value = this.computer();
        this.notify();
    }

    destroy(): void {
        for (const parent of this.parents) {
            parent.unsubscribe(this);
        }
    }

    notify(): void {
        for (const subscriber of this.subscribers) {
            subscriber.update();
        }
    }

    notifyParents(): void {
        for (const parent of this.parents) {
            parent.notify();
        }
    }

    set(): void {
        // not allowed
    }

    setPathValue(): void {
        // not allowed
    }

    subscribe(subscriber: StateLink): void {
        this.subscribers.push(subscriber);
    }

    unsubscribe(subscriber: StateLink): void {
        const index: number = this.subscribers.indexOf(subscriber);
        if (index !== -1) {
            this.subscribers.splice(index, 1);
        }
    }
}