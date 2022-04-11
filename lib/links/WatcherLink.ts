import State from "../states/State";
import StateLink from "./StateLink";

export default class WatcherLink implements StateLink {

    private watcher: () => void;
    private states: State<any>[];

    constructor(watcher: () => void, ...states: State<any>[]) {
        this.watcher = watcher;
        this.states = states;
    }

    init(): void {
        // do nothing
    }
    update(): void {
        this.watcher();
    }
    destroy(): void {
        for (const state of this.states) {
            state.unsubscribe(this);
        }
    }

}