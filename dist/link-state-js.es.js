var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
const booleanAttributes = [
  "allowfullscreen",
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
  "truespeed"
];
class AttributeLink$1 {
  constructor(element, attributeName, valueFunction, states) {
    __publicField(this, "element");
    __publicField(this, "attributeName");
    __publicField(this, "valueFunction");
    __publicField(this, "states");
    __publicField(this, "staticValue");
    __publicField(this, "isBooleanAttribute");
    var _a;
    this.element = element;
    this.attributeName = attributeName;
    this.valueFunction = valueFunction;
    this.states = states;
    this.staticValue = (_a = element.getAttribute(this.attributeName)) != null ? _a : "";
    this.isBooleanAttribute = booleanAttributes.includes(this.attributeName);
    this.update();
  }
  update() {
    this.element.removeAttribute(this.attributeName);
    const value = this.valueFunction();
    if (!this.isBooleanAttribute || value) {
      const val = this.staticValue ? [this.staticValue, value].join(" ") : value;
      this.element.setAttribute(this.attributeName, val);
      if (this.attributeName === "value") {
        this.element.value = val;
      }
    }
  }
  destroy() {
    for (const s of this.states) {
      s.unsubscribe(this);
    }
  }
}
class EventListenerLink {
  constructor(element, eventName, listener2) {
    __publicField(this, "element");
    __publicField(this, "eventName");
    __publicField(this, "listener");
    this.element = element;
    this.eventName = eventName;
    this.listener = listener2;
    this.element.addEventListener(this.eventName, this.listener);
  }
  update() {
    throw new Error("Method not implemented.");
  }
  destroy() {
    this.element.removeEventListener(this.eventName, this.listener);
  }
}
class AttributeLink {
  constructor(element, state2, statePath = void 0) {
    __publicField(this, "element");
    __publicField(this, "targetAttribute");
    __publicField(this, "state");
    __publicField(this, "statePath");
    __publicField(this, "eventListener");
    this.element = element;
    this.state = state2;
    const dotIndex = statePath == null ? void 0 : statePath.indexOf(".");
    this.statePath = dotIndex && dotIndex !== -1 ? statePath == null ? void 0 : statePath.substring(dotIndex + 1) : void 0;
    this.targetAttribute = element.getAttribute("type") === "checkbox" ? "checked" : "value";
    this.eventListener = (event) => {
      const target = event.target;
      if (target) {
        if (this.statePath && this.state.value) {
          this.state.value.setValueForPath(this.statePath, target[this.targetAttribute]);
        } else {
          this.state.value = target[this.targetAttribute];
        }
      }
    };
    this.element.addEventListener("input", this.eventListener);
    this.update();
  }
  update() {
    var _a;
    this.element[this.targetAttribute] = (_a = this.state.value) == null ? void 0 : _a.getValueForPath(this.statePath);
  }
  destroy() {
    this.state.unsubscribe(this);
    this.element.removeEventListener("input", this.eventListener);
  }
}
function insertAfter(newNode, referenceNode) {
  const referenceParent = referenceNode.parentElement;
  if (!referenceParent) {
    return;
  }
  const refrenceSibling = referenceNode.nextSibling;
  referenceParent.insertBefore(newNode, refrenceSibling);
}
function insertBefore(newNode, referenceNode) {
  const referenceParent = referenceNode.parentElement;
  if (!referenceParent) {
    return;
  }
  referenceParent.insertBefore(newNode, referenceNode);
}
class RenderLink {
  constructor(element, condition, states) {
    __publicField(this, "element");
    __publicField(this, "condition");
    __publicField(this, "states");
    __publicField(this, "ifComment");
    __publicField(this, "isElementRendered");
    this.element = element;
    this.condition = condition;
    this.states = states;
    this.ifComment = document.createComment("link-state-js-if");
    insertBefore(this.ifComment, element);
    this.update();
  }
  update() {
    const result = this.condition();
    if (result) {
      if (!this.isElementRendered || this.isElementRendered === void 0) {
        this.isElementRendered = result;
        insertAfter(this.element, this.ifComment);
      }
    } else {
      if (this.isElementRendered || this.isElementRendered === void 0) {
        this.isElementRendered = result;
        this.element.remove();
      }
    }
  }
  destroy() {
    for (const s of this.states) {
      s.unsubscribe(this);
    }
    this.ifComment.remove();
  }
}
class TextLink {
  constructor(element, valueFunction, states) {
    __publicField(this, "element");
    __publicField(this, "valueFunction");
    __publicField(this, "states");
    this.element = element;
    this.valueFunction = valueFunction;
    this.states = states;
    this.update();
  }
  update() {
    this.element.textContent = this.valueFunction();
  }
  destroy() {
    for (const s of this.states) {
      s.unsubscribe(this);
    }
  }
}
class MutableState {
  constructor(value) {
    __publicField(this, "_value");
    __publicField(this, "subscribers", []);
    this._value = value;
    if (this._value instanceof Array) {
      this._value = new Proxy(this._value, {
        get: (target, property, receiver) => {
          const result = Reflect.get(target, property, receiver);
          if (property === "push" || property === "shift" || property === "unshift" || property === "pop" || property === "sort") {
            return (...args) => {
              target[property](...args);
              this.notify();
            };
          } else if (property === "splice") {
            return (pos, amount) => {
              target[property](pos, amount);
              this.notify();
            };
          }
          return result;
        }
      });
    } else if (this._value instanceof Object) {
      this._value = new Proxy(this._value, {
        set: (target, property, value2, receiver) => {
          const result = Reflect.set(target, property, value2, receiver);
          this.notify();
          return result;
        }
      });
    }
  }
  set value(newValue) {
    this.set(newValue);
  }
  get value() {
    return this._value;
  }
  set(newValue) {
    if (this._value !== newValue) {
      this._value = newValue;
      this.notify();
    }
  }
  setPathValue(keyPath, newValue) {
    this._value.setValueForKeyPath(keyPath, newValue);
    this.notify();
  }
  subscribe(subscriber) {
    this.subscribers.push(subscriber);
  }
  unsubscribe(subscriber) {
    const index = this.subscribers.indexOf(subscriber);
    if (index !== -1) {
      this.subscribers.splice(index, 1);
    }
  }
  notify() {
    for (const subscriber of this.subscribers) {
      subscriber.update();
    }
  }
}
class LoopLink {
  constructor(element, itemName, state2, parentStates, foreachSetup) {
    __publicField(this, "element");
    __publicField(this, "itemName");
    __publicField(this, "state");
    __publicField(this, "parentStates");
    __publicField(this, "foreachSetup");
    __publicField(this, "template");
    __publicField(this, "loopInstances");
    __publicField(this, "forComment");
    this.element = element;
    this.itemName = itemName;
    this.state = state2;
    this.parentStates = parentStates;
    this.foreachSetup = foreachSetup;
    this.template = this.element.cloneNode(true);
    this.loopInstances = /* @__PURE__ */ new Map();
    this.forComment = document.createComment("link-state-js-for");
    insertBefore(this.forComment, element);
    this.element.remove();
    this.update();
  }
  update() {
    this.resetLoop();
    this.insertLoopChildren();
  }
  resetLoop() {
    for (const [element, links] of this.loopInstances.entries()) {
      element.remove();
      destory(...links);
    }
    this.loopInstances.clear();
  }
  insertLoopChildren() {
    const stateAsArray = Array.from(this.state.value);
    for (let i = stateAsArray.length - 1; i >= 0; i--) {
      const loopValue = stateAsArray[i];
      const loopElement = this.template.cloneNode(true);
      const links = setup({
        element: loopElement,
        setupFunction: () => {
          const loopState = {};
          for (const key of Object.keys(this.parentStates)) {
            loopState[key] = this.parentStates[key];
          }
          loopState[this.itemName] = new MutableState(loopValue);
          loopState["_index"] = new MutableState(i);
          if (this.foreachSetup) {
            const foreachSetupState = this.foreachSetup({ element: loopElement, states: loopState }) || {};
            for (const key of Object.keys(foreachSetupState)) {
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
  destroy() {
    this.state.unsubscribe(this);
    this.forComment.remove();
  }
}
class WatcherLink {
  constructor(watcher, ...states) {
    __publicField(this, "watcher");
    __publicField(this, "states");
    this.watcher = watcher;
    this.states = states;
  }
  init() {
  }
  update() {
    this.watcher();
  }
  destroy() {
    for (const state2 of this.states) {
      state2.unsubscribe(this);
    }
  }
}
class ComputedState {
  constructor(computer, parents) {
    __publicField(this, "value");
    __publicField(this, "computer");
    __publicField(this, "parents", []);
    __publicField(this, "subscribers", []);
    this.computer = computer;
    this.value = this.computer();
    this.parents = parents;
  }
  update() {
    this.value = this.computer();
    this.notify();
  }
  destroy() {
    for (const parent2 of this.parents) {
      parent2.unsubscribe(this);
    }
  }
  notify() {
    for (const subscriber of this.subscribers) {
      subscriber.update();
    }
  }
  notifyParents() {
    for (const parent2 of this.parents) {
      parent2.notify();
    }
  }
  set() {
  }
  setPathValue() {
  }
  subscribe(subscriber) {
    this.subscribers.push(subscriber);
  }
  unsubscribe(subscriber) {
    const index = this.subscribers.indexOf(subscriber);
    if (index !== -1) {
      this.subscribers.splice(index, 1);
    }
  }
}
function getValue(obj, path) {
  if (!path || !obj) {
    return obj;
  }
  const dotIndex = path.indexOf(".");
  if (dotIndex !== -1) {
    const subPath = path.substring(dotIndex + 1);
    const subPathDotIndex = subPath.indexOf(".");
    if (subPathDotIndex !== -1) {
      return getValue(obj[subPath.substring(0, subPathDotIndex)], subPath);
    }
    return obj[subPath];
  }
  return obj;
}
function getObjName(path) {
  const dotIndex = path.indexOf(".");
  if (dotIndex !== -1) {
    return path.substring(0, dotIndex);
  }
  const bracketIndex = path.indexOf("(");
  if (bracketIndex !== -1) {
    return path.substring(0, bracketIndex);
  }
  return path;
}
Object.defineProperty(Object.prototype, "setValueForKey", {
  value: function(value, key) {
    this[key] = value;
  }
});
Object.defineProperty(Object.prototype, "setValueForPath", {
  value: function(keyPath, value) {
    if (keyPath == null) {
      return;
    }
    if (keyPath.indexOf(".") === -1) {
      this.setValueForKey(value, keyPath);
      return;
    }
    const chain = keyPath.split(".");
    const firstKey = chain.shift();
    const shiftedKeyPath = chain.join(".");
    if (firstKey) {
      this[firstKey].setValueForPath(shiftedKeyPath, value);
    }
  }
});
Object.defineProperty(Object.prototype, "getValueForKey", {
  value: function(key) {
    return this[key];
  }
});
Object.defineProperty(Object.prototype, "getValueForPath", {
  value: function(keyPath) {
    if (keyPath == null)
      return this;
    if (keyPath.indexOf(".") === -1) {
      return this.getValueForKey(keyPath);
    }
    var chain = keyPath.split(".");
    var firstKey = chain.shift();
    var shiftedKeyPath = chain.join(".");
    if (firstKey) {
      return this[firstKey].getValueForPath(shiftedKeyPath);
    }
  }
});
function state(value) {
  return new MutableState(value);
}
function computed(computer, ...states) {
  const computedState = new ComputedState(computer, states);
  for (const s of states) {
    s.subscribe(computedState);
  }
  return computedState;
}
function watch(watcher, ...states) {
  const watcherLink = new WatcherLink(watcher, ...states);
  for (const s of states) {
    s.subscribe(watcherLink);
  }
  return watcherLink;
}
let parent = document;
function fetchElement(selector) {
  const element = parent instanceof Element && parent.matches(selector) && parent || parent.querySelector(selector);
  if (!element) {
    throw new Error(`Element not found with given selector ${selector}. Please make sure element exists.`);
  }
  return element;
}
function fetchAllElements(element, selector) {
  const elements = [element, ...Array.from(element.querySelectorAll(selector))].filter((el) => el.matches(selector));
  return elements;
}
function text({ selector, element = fetchElement(selector), text: text2, states }) {
  const textLink = new TextLink(element, text2, states);
  for (const s of states) {
    s.subscribe(textLink);
  }
  return textLink;
}
function textState({ selector, element = fetchElement(selector), state: state2 }) {
  const textLink = new TextLink(element, () => state2.value, [state2]);
  state2.subscribe(textLink);
  return textLink;
}
function attribute({ selector, element = fetchElement(selector), name, value, states }) {
  const attributeLink = new AttributeLink$1(element, name, value, states);
  for (const s of states) {
    s.subscribe(attributeLink);
  }
  return attributeLink;
}
function attributeState({ selector, element = fetchElement(selector), name, state: state2 }) {
  return attribute({ element, name, value: () => `${state2.value}`, states: [state2] });
}
function model({ selector, element = fetchElement(selector), state: state2, statePath }) {
  const modelLink = new AttributeLink(element, state2, statePath);
  state2.subscribe(modelLink);
  return modelLink;
}
function rendered({ selector, element = fetchElement(selector), condition, states }) {
  const renderLink = new RenderLink(element, condition, states);
  for (const s of states) {
    s.subscribe(renderLink);
  }
  return renderLink;
}
function loop({ selector, element = fetchElement(selector), itemName, state: state2, parentStates = {}, foreachSetup }) {
  const loopLink = new LoopLink(element, itemName, state2, parentStates, foreachSetup);
  state2.subscribe(loopLink);
  return loopLink;
}
function listener({ selector, element = fetchElement(selector), trigger: eventName, listener: listener2 }) {
  return new EventListenerLink(element, eventName, listener2);
}
function setup({ selector, element = fetchElement(selector), setupFunction }) {
  parent = element;
  const states = setupFunction({
    element
  });
  let links = [];
  if (states) {
    links = autoLink({ element, states });
  }
  parent = document;
  return links;
}
function destory(...links) {
  for (const l of links) {
    l.destroy();
  }
}
function autoLink({ selector, element: appElement = fetchElement(selector), states }) {
  const links = [];
  let skipFurtherLinking = false;
  computeElements(appElement, states, "data-state-setup", (element, { listener: setupFunction }) => {
    if (!setupFunction)
      return;
    setup({ element, setupFunction }).forEach((l) => links.push(l));
    skipFurtherLinking = true;
  });
  if (skipFurtherLinking)
    return links;
  computeElements(appElement, states, "data-state-foreach", (element, { state: state2, companion: itemName }) => {
    if (!state2 || !itemName)
      return;
    element.removeAttribute("data-state-foreach");
    const foreachSetupName = element.getAttribute("data-state-foreach-setup");
    const foreachSetup = foreachSetupName !== null ? states[foreachSetupName] : void 0;
    links.push(loop({ element, state: state2, itemName, parentStates: states, foreachSetup }));
  });
  computeElements(appElement, states, "data-state-text", (element, { state: state2, statePath, listener: listener2 }) => {
    if (!state2 && !listener2)
      return;
    let s;
    let stes;
    if (!state2) {
      const l = parameterListener(listener2, statePath, states);
      s = computed(() => l.listener(), ...l.states);
      stes = l.states;
    } else {
      s = state2;
      stes = [state2];
    }
    links.push(text({ element, text: () => getValue(s.value, statePath), states: stes }));
  });
  computeElements(appElement, states, "data-state-attribute", (element, { state: state2, companion: attr, statePath, listener: listener2 }) => {
    if (!state2 && !listener2 && !attr)
      return;
    let s;
    let stes;
    if (!state2) {
      const l = parameterListener(listener2, statePath, states);
      s = computed(() => l.listener(), ...l.states);
      stes = l.states;
    } else {
      s = state2;
      stes = [state2];
    }
    links.push(attribute({ element, name: attr, value: () => getValue(s.value, statePath), states: stes }));
  });
  computeElements(appElement, states, "data-state-model", (element, { state: state2, statePath }) => {
    if (!state2)
      return;
    links.push(model({ element, state: state2, statePath }));
  });
  computeElements(appElement, states, "data-state-listener", (element, { listener: l, companion: trigger, statePath }) => {
    if (!l || !trigger)
      return;
    links.push(listener({ element, trigger, listener: parameterListener(l, statePath, states).listener }));
  });
  computeElements(appElement, states, "data-state-rendered", (element, { state: state2, statePath }) => {
    if (!state2)
      return;
    links.push(rendered({ element, condition: () => getValue(state2.value, statePath), states: [state2] }));
  });
  return links;
}
function computeElements(element, states, attribute2, computer) {
  for (const ele of fetchAllElements(element, `[${attribute2}]`)) {
    for (let attr of ele.getAttribute(attribute2).split(";")) {
      attr = attr.trim();
      const attrBraketEndIndex = attr.indexOf(")");
      if (attr.startsWith("(") && attrBraketEndIndex !== -1) {
        const state2 = computedObjectState(attr, states);
        if (!state2) {
          continue;
        }
        computer(ele, {
          state: state2,
          companion: attr.substring(attrBraketEndIndex + 2).trim()
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
function computedObjectState(attr, states) {
  const stateLookupResults = [];
  for (const objectAttr of attr.substring(1, attr.indexOf(")")).trim().split(",")) {
    const result = stateLookup(objectAttr.trim(), states);
    if (result.companion && result.state) {
      stateLookupResults.push(result);
    }
  }
  if (stateLookupResults.length > 0) {
    const states2 = stateLookupResults.map((r) => r.state);
    return computed(() => stateLookupResults.map(({ state: state2, companion, statePath }) => `${companion}:${getValue(state2.value, statePath)}`).join(";"), ...states2);
  }
  return void 0;
}
function parameterListener(listener2, statePath, states) {
  var _a;
  const bracketIndex = statePath == null ? void 0 : statePath.indexOf("(");
  if (bracketIndex && bracketIndex !== -1) {
    const paramStates = [];
    for (const param of ((_a = statePath == null ? void 0 : statePath.substring(bracketIndex + 1, statePath == null ? void 0 : statePath.indexOf(")"))) == null ? void 0 : _a.split(",")) || []) {
      const stateResult = stateLookup(param.trim(), states);
      if (stateResult.state) {
        paramStates.push(stateResult);
      }
    }
    return {
      listener: (event) => {
        const args = [];
        for (const paramState of paramStates) {
          args.push(paramState.state.value);
        }
        return listener2(...args, event);
      },
      states: paramStates.map((p) => p.state)
    };
  }
  return {
    listener: listener2,
    states: []
  };
}
function stateLookup(attr, states) {
  const [stateName, companion] = attr.split("@");
  let state2 = states[getObjName(stateName)];
  let listener2 = void 0;
  if (state2 instanceof Function) {
    listener2 = state2;
    state2 = void 0;
  }
  return {
    state: state2,
    listener: listener2,
    statePath: stateName,
    companion
  };
}
export { attribute, attributeState, autoLink, computed, destory, listener, loop, model, rendered, setup, state, text, textState, watch };
