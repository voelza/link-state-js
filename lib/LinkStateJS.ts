import AttributeLink from "./links/AttributeLink";
import EventListenerLink from "./links/EventListenerLink";
import ModelLink from "./links/ModelLink";
import RenderLink from "./links/RenderLink";
import StateLink from "./links/StateLink";
import TextLink from "./links/TextLink";
import ComputedState from "./states/ComputedState";
import MutableState from "./states/MutableState";
import State from "./states/State";

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
    state: State<any>
};
export function model({ selector, element = fetchElement(selector!), state }: ModelStateData): ModelLink {
    const modelLink = new ModelLink(element, state);
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
    setupFunction: (state: SetupState) => Object | undefined
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
    computeElements(appElement, states, "data-state-setup", (element: Element, setupFunction: State<any> | Function) => {
        if (!(setupFunction instanceof Function)) return;
        setup({ element, setupFunction: setupFunction as (state: SetupState) => Object | undefined }).forEach(l => links.push(l));
        skipFurtherLinking = true;
    });
    if (skipFurtherLinking) {
        return links;
    }

    computeElements(appElement, states, "data-state-text", (element: Element, state: State<any> | Function) => {
        if (state instanceof Function) return;
        links.push(textState({ element, state }));
    });
    computeElements(appElement, states, "data-state-attribute", (element: Element, state: State<any> | Function, attribute: string | undefined) => {
        if (state instanceof Function || !attribute) return;
        links.push(attributeState({ element, name: attribute, state }));
    });
    computeElements(appElement, states, "data-state-model", (element: Element, state: State<any> | Function) => {
        if (state instanceof Function) return;
        links.push(model({ element, state }));
    });
    computeElements(appElement, states, "data-state-listener", (element: Element, l: State<any> | Function, event: string | undefined) => {
        if (!(l instanceof Function) || !event) return;
        links.push(listener({ element, trigger: event, listener: l as (event: any) => void }));
    });
    computeElements(appElement, states, "data-state-rendered", (element: Element, state: State<any> | Function) => {
        if (state instanceof Function) return;
        links.push(rendered({ element, condition: () => state.value, states: [state] }));
    });

    return links;
}

function computeElements(element: Element, states: any, attribute: string, computer: (element: Element, state: State<any> | Function, event: string | undefined) => void) {
    for (const ele of fetchAllElements(element, `[${attribute}]`)) {
        const [stateName, event] = ele.getAttribute(attribute)!.split("@");
        const state = states[stateName];
        if (!state) {
            continue;
        }
        computer(ele, state, event);
    }
}