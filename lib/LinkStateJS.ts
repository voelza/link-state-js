import AttributeLink from "./links/AttributeLink";
import EventListenerLink from "./links/EventListenerLink";
import ModelLink from "./links/ModelLink";
import RenderLink from "./links/RenderLink";
import StateLink from "./links/StateLink";
import TextLink from "./links/TextLink";
import LoopLink from "./links/LoopLink";
import WatcherLink from "./links/WatcherLink";
import ComputedState from "./states/ComputedState";
import MutableState from "./states/MutableState";
import State from "./states/State";
import { getObjName, getValue } from "./utils/PathHelper";

Object.defineProperty(Object.prototype, "setValueForKey", {
    value: function (value: any, key: string) { this[key] = value; }
});
Object.defineProperty(Object.prototype, "setValueForPath", {
    value: function (keyPath: string, value: any): void {
        if (keyPath == null) {
            return;
        }

        if (keyPath.indexOf('.') === -1) {
            this.setValueForKey(value, keyPath);
            return;
        }

        const chain: string[] = keyPath.split('.');
        const firstKey: string | undefined = chain.shift();
        const shiftedKeyPath: string = chain.join('.');

        if (firstKey) {
            this[firstKey].setValueForPath(shiftedKeyPath, value);
        }
    }
});
Object.defineProperty(Object.prototype, "getValueForKey", {
    value: function (key: string): void {
        return this[key];
    }
});
Object.defineProperty(Object.prototype, "getValueForPath", {
    value: function (keyPath: string): any {
        if (keyPath == null) return this;
        if (keyPath.indexOf('.') === -1) {
            return this.getValueForKey(keyPath);
        }

        var chain: string[] = keyPath.split('.');
        var firstKey: string | undefined = chain.shift();
        var shiftedKeyPath: string = chain.join('.');

        if (firstKey) {
            return this[firstKey].getValueForPath(shiftedKeyPath);
        }
    }
});

export function state<T>(value: T): State<T> {
    return new MutableState(value);
}

export function computed<T>(computer: () => T, ...states: State<any>[]): ComputedState<T> {
    const computedState = new ComputedState(computer, states);
    for (const s of states) {
        s.subscribe(computedState);
    }
    return computedState;
}

export function watch(watcher: () => void, ...states: State<any>[]): WatcherLink {
    const watcherLink = new WatcherLink(watcher, ...states);
    for (const s of states) {
        s.subscribe(watcherLink);
    }
    return watcherLink;
}

let parent: Element | Document = document;
function fetchElement(selector: string): Element {
    const element = parent instanceof Element && parent.matches(selector) && parent || parent.querySelector(selector);
    if (!element) {
        throw new Error(`Element not found with given selector ${selector}. Please make sure element exists.`);
    }
    return element;
}

function fetchAllElements(element: Element, selector: string): Element[] {
    const elements = [element, ...Array.from(element.querySelectorAll(selector))].filter(el => el.matches(selector));
    return elements;
}

export type TextLinkData = {
    element?: Element
    selector?: string,
    text: () => string,
    states: State<any>[]
};
export function text({ selector, element = fetchElement(selector!), text, states }: TextLinkData): TextLink {
    const textLink = new TextLink(element, text, states);
    for (const s of states) {
        s.subscribe(textLink);
    }
    return textLink;
}

export type TextStateLinkData = {
    element?: Element
    selector?: string,
    state: State<any>
};
export function textState({ selector, element = fetchElement(selector!), state }: TextStateLinkData): TextLink {
    const textLink = new TextLink(element, () => state.value, [state]);
    state.subscribe(textLink);
    return textLink;
}

export type AttributeLinkData = {
    element?: Element
    selector?: string,
    name: string,
    value: () => string,
    states: State<any>[]
};
export function attribute({ selector, element = fetchElement(selector!), name, value, states }: AttributeLinkData): AttributeLink {
    const attributeLink = new AttributeLink(element, name, value, states);
    for (const s of states) {
        s.subscribe(attributeLink);
    }
    return attributeLink;
}

export type AttributeStateLinkData = {
    element?: Element
    selector?: string,
    name: string,
    state: State<any>
};
export function attributeState({ selector, element = fetchElement(selector!), name, state }: AttributeStateLinkData): AttributeLink {
    return attribute({ element, name, value: () => `${state.value}`, states: [state] });
}

export type ModelStateData = {
    element?: Element
    selector?: string,
    state: State<any>,
    statePath?: string | undefined
};
export function model({ selector, element = fetchElement(selector!), state, statePath }: ModelStateData): ModelLink {
    const modelLink = new ModelLink(element, state, statePath);
    state.subscribe(modelLink);
    return modelLink;
}

export type RenderLinkData = {
    element?: Element
    selector?: string,
    condition: () => boolean,
    states: State<any>[]
};
export function rendered({ selector, element = fetchElement(selector!), condition, states }: RenderLinkData): RenderLink {
    const renderLink = new RenderLink(element, condition, states);
    for (const s of states) {
        s.subscribe(renderLink);
    }
    return renderLink;
}

export type LoopLinkData = {
    element?: Element,
    selector?: string,
    itemName: string,
    state: State<Iterable<any>>,
    parentStates?: Object
}
export function loop({ selector, element = fetchElement(selector!), itemName, state, parentStates = {} }: LoopLinkData): LoopLink {
    const loopLink = new LoopLink(element, itemName, state, parentStates);
    state.subscribe(loopLink);
    return loopLink;
}

export type ListenerData = {
    element?: Element
    selector?: string,
    trigger: string,
    listener: (event: any) => void
};
export function listener({ selector, element = fetchElement(selector!), trigger: eventName, listener }: ListenerData): EventListenerLink {
    return new EventListenerLink(element, eventName, listener);
}

export type SetupInput = {
    element?: Element,
    selector?: string,
    setupFunction: (state: SetupState) => Object | void
};
export type SetupState = {
    element: Element
};
export function setup({ selector, element = fetchElement(selector!), setupFunction }: SetupInput): StateLink[] {
    parent = element;
    const states = setupFunction({
        element: element
    });
    let links: StateLink[] = [];
    if (states) {
        links = autoLink({ element, states });
    }
    parent = document;
    return links;
}

export function destory(...links: StateLink[]): void {
    for (const l of links) {
        l.destroy();
    }
}

export type AutoLinkData = {
    element?: Element,
    selector?: string,
    states: Object
};
export function autoLink({ selector, element: appElement = fetchElement(selector!), states }: AutoLinkData): StateLink[] {
    const links: StateLink[] = [];
    let skipFurtherLinking = false;
    computeElements(appElement, states, "data-state-setup", (element: Element, { listener: setupFunction }) => {
        if (!setupFunction) return;
        setup({ element, setupFunction: setupFunction as (state: SetupState) => Object | undefined }).forEach(l => links.push(l));
        skipFurtherLinking = true;
    });
    if (skipFurtherLinking) return links;

    computeElements(appElement, states, "data-state-foreach", (element: Element, { state, companion: itemName }) => {
        if (!state || !itemName) return;
        element.removeAttribute("data-state-foreach");
        links.push(loop({ element, state, itemName, parentStates: states }));
    });
    computeElements(appElement, states, "data-state-text", (element: Element, { state, statePath }) => {
        if (!state) return;
        links.push(text({ element, text: () => getValue(state.value, statePath), states: [state] }));
    });
    computeElements(appElement, states, "data-state-attribute", (element: Element, { state, companion: attr, statePath }) => {
        if (!state || !attr) return;
        links.push(attribute({ element, name: attr, value: () => getValue(state.value, statePath), states: [state] }));
    });
    computeElements(appElement, states, "data-state-model", (element: Element, { state, statePath }) => {
        if (!state) return;
        links.push(model({ element, state, statePath }));
    });
    computeElements(appElement, states, "data-state-listener", (element: Element, { listener: l, companion: trigger, statePath }) => {
        if (!l || !trigger) return;
        links.push(listener({ element, trigger, listener: parameterListener(l, statePath, states) as (event: any) => void }));
    });
    computeElements(appElement, states, "data-state-rendered", (element: Element, { state, statePath }) => {
        if (!state) return;
        links.push(rendered({ element, condition: () => getValue(state.value, statePath), states: [state] }));
    });

    return links;
}

function computeElements(element: Element, states: any, attribute: string, computer: (element: Element, result: StateLookupResult) => void) {
    for (const ele of fetchAllElements(element, `[${attribute}]`)) {
        for (let attr of ele.getAttribute(attribute)!.split(";")) {
            attr = attr.trim();
            const attrBraketEndIndex = attr.indexOf(")");
            if (attr.startsWith("(") && attrBraketEndIndex !== -1) {
                const state = computedObjectState(attr, states);
                if (!state) {
                    continue;
                }
                computer(ele, {
                    state, companion: attr.substring(attrBraketEndIndex + 2).trim()
                });
            } else {
                const result = stateLookup(attr, states);
                if (!result.state && !result.listener) {
                    continue;
                }
                computer(ele, result);
            }
        }
    }
}

function computedObjectState(attr: string, states: any): ComputedState<any> | undefined {
    const stateLookupResults: StateLookupResult[] = [];
    for (const objectAttr of attr.substring(1, attr.indexOf(")")).trim().split(",")) {
        const result = stateLookup(objectAttr.trim(), states);
        if (result.companion && result.state) {
            stateLookupResults.push(result);
        }
    }
    if (stateLookupResults.length > 0) {
        // @ts-ignore
        const states: State<any>[] = stateLookupResults.map(r => r.state);
        // @ts-ignore
        return computed(() => stateLookupResults.map(({ state, companion, statePath }) => `${companion}:${getValue(state.value, statePath)}`).join(";"), ...states);
    }
    return undefined;
}

function parameterListener(listener: Function, statePath: string | undefined, states: any): Function {
    const bracketIndex: number | undefined = statePath?.indexOf("(");
    if (bracketIndex && bracketIndex !== -1) {
        const paramStates: StateLookupResult[] = [];
        for (const param of statePath?.substring(bracketIndex + 1, statePath?.indexOf(")"))?.split(",") || []) {
            const stateResult: StateLookupResult = stateLookup(param, states);
            if (stateResult.state) {
                paramStates.push(stateResult);
            }
        }

        return (event: any) => {
            const args: State<any>[] = [];
            for (const paramState of paramStates) {
                args.push(paramState.state!.value);
            }
            listener(...args, event)
        };
    }
    return listener;
}

type StateLookupResult = {
    state?: State<any> | undefined,
    listener?: Function | undefined,
    statePath?: string | undefined,
    companion: string | undefined;
}
function stateLookup(attr: string, states: any): StateLookupResult {
    const [stateName, companion] = attr.split("@");
    let state = states[getObjName(stateName)];
    let listener = undefined;
    if (state instanceof Function) {
        listener = state;
        state = undefined;
    }
    return {
        state,
        listener,
        statePath: stateName,
        companion
    }
}