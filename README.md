# Link-State-JS
Very simple JavaScript framework to link DOM elements to states which live in JavaScript. Whenever the state changes the linked DOM elements will change accordingly.

# Syntax
To declare a state you can use the `state` function. 
```typescript
const count: State<number> = state(0);
```
These states are alway mutable and can be changed by using the `value` field on theses states.

```typescript
const count: State<number> = state(0);
const counter = () => {
    count.value++;
}
```
So whenever `count.value` is incremented, all the linked DOM elements will change according to their type. To link a DOM element to different states you can different link functions (see more in  [Links](##links)). In this example we are going to use the `text` function to link the text of an element to our `count` state and the `listener` function to add a event-listener to our button.
```html
<span id="count"></span>
<button id="counter">Count++</button>
```
```typescript
const count: State<number> = state(0);
const counter = () => {
    count.value++;
}

text({ element: document.getElementById("count")!, text: () => `${count.value}`, states: [count] });
listener({ element: document.getElementById("counter")!, trigger: "click", listener: counter });
```
Afterwards our `count` state is linked to the span-element with the id "count" and will update its textContent whenever the state `count` changes. The state `count` is changed by calling the `.value` field and assigning to a new value. We do this by adding the event listener to the button-element with the id "counter" and bind the counter-function to it.

## States

States are values which can be changed within your application. There are differnt types of states you can declare.

### Mutuable States

With the `state` function you can create a mutable state which wrappes the given state within a proxy. The state can be changed by assigning the `.value` field within to a new value. 
```typescript
const count: State<number> = state(0);
count.value = 10;
```
Whenever a state is changed all the linked DOM elements will change automatically. But sometimes you might want to do more complex changes which will not be detected by the proxy. Theses changes are mainly object manipulations. Whenever you think the state must change but it didn't automatically you can call the `notify` method on every state which will automatically trigger the update-cycle.
```typescript
const count: State<Object> = state({ count: 0 });
count.value["count"] = 10;
count.notify();
```

### Computed States
Sometimes you want to depict states which are depended on other states. In this frameworks theses states are called computed states and can be created using the `computed` function.
```typescript
const count: State<number> = state(0);
const countDoubled: State<number> = computed(() => count.value * 2, count);
```
As you can see `computed` takes in a coupter function which will represent the state's value. The computed state is also depended on the `count` state which is why we pass it as states into the `computed` function. When we use a computed value in a link we will get the currently computed value depending on our computer function. In this case we will get the value of the `count` state multiplied by 2. Beware that while computed states give you a `value` field that you can access it should never be reassigned. This is simply meant as a shortcut to create a state which can easily be linked to the DOM.

## Links

Links are different function which will bind given values to a given element and update whenever one of the given states will change. The following links exist:

- [text](###text-link) to link to the textContent of an element.
- [textState](###textstate-link) to link to the textContent of an element.
- [attribute](###attribute-link) to link to an attribute of an element.
- [model](###model-link) to link a state to a "value" attribute and add a "input"-event-listener which updates the state whenever the event occurs on the linked element.
- [rendered](###rendered-link) to remove or add an element whenever a given condition is false or true.

### Generally ...
Generally all the link functions have a similar API. You can either call them by give them a DOM element directly or you can give them a selector. So if you want to link a text to a state you can chose between theses two alternatives. 
```typescript
// so instead of this:
text({ element: document.getElementById("count")!, text: () => `${count.value}`, states: [count] });
// you can also write this:
text({ selector: "#count", text: () => `${count.value}`, states: [count] });
```
For simplicity sake from now on we will only use the selector-version of the link functions.

### Text Link
To create a text link use the `text` function. It takes in an `element` or a `selector`, a function `text` which returns the textContent which will be displayed and the `states` on which this link should update.
```typescript
text({ selector: "#count", text: () => `${count.value}`, states: [count] });
```

### TextState Link
If you only want to link the state of a single state to an element you can use `textState` to create a text link. It takes in an `element` or a `selector` and the `state` which will be used to display the textContent and which will trigger a rerender if it updates.
```typescript
textState({ selector: "#count", state: count });
```

### Attribute Link
To create a attribute link use the `attribute` function. It takes in an `element` or a `selector`, the name of the attribute as `name`, a function `value` which returns the value of the attribute and the `states` on which this link should update.
```typescript
const color = state("#a1dda8");
attribute({ selector: "body", name: "style", value: () => `background-color: ${color.value};`, states: [color] });
```

### Attribute State
If you only want to link the state of a single state to an element you can use `attributeLink` to create a attribute link. It takes in an `element` or a `selector`, the `name` of the attribute and the `state` which will be used to set the attribute on the element and which will trigger a rerender if it updates.
```typescript
const value = state("This is the value");
attribute({ selector: "body", name: "value", state: value });
```

### Model Link
A  model link is a two-way binding between a state and a given input-element. It can be used on all element which have a value attribute and trigger an input event. Whenever the input of the given element changes the state will change and the other way around: When the state changes the value attribute of the element will change. To bind this you use the `model` function which takes in an `element` or a `selector` and a `state` to bind the element to.
```html
<input type="color" id="color" />
```
```typescript
const color = state("#a1dda8");
model({ selector: "#color", state: color });
```

### Render Link
Sometimes you only want to display elements on the DOM in some situations (depending on states). You can do this by using the `rendered` function which will enter or remove the linked element to the DOM depending on its condition. You can use the function by passing an `element` or a `selector`, a `condition` function which returns a boolean and the `states` on which this link should update.
```html
<span id="high">!! This is getting really high now!!</span>
<button id="counter">Count++</button>
```
```typescript
const count: State<number> = state(0);
const counter = () => {
    count.value++;
}

rendered({ selector: "#high", condition: () => count.value > 10, states: [count] });
listener({ selector: "#counter", trigger: "click", listener: counter });
```

### ForEach Link
If you have a iterable state you might want to iterate over it and render the same element as a template for each element in this state. For this you can use the `forEach` function. It takes an `element` or a `selector`, `itemName` as the name of the loop-state which then can be used within the template and the `state` which must be iterable list. Additionally you can pass states as `parentStates` which then can be used within the template of the loop.
```html
<div id="fruits"><span date-state-text="counter"></span><span date-state-text="name"></span></div>
```
```typescript
const list = state(["apples", "bananas", "oranges"]);
const counter = state(10);
loop({ selector: "#fruits", itemName: "name", state: list, parentStates: {counter} });
```
Which will result in:
```html
<div id="fruits"><span date-state-text="counter">10</span><span date-state-text="name">apples</span></div>
<div id="fruits"><span date-state-text="counter">10</span><span date-state-text="name">bananas</span></div>
<div id="fruits"><span date-state-text="counter">10</span><span date-state-text="name">oranges</span></div>
```

## Event Listener
You can bind your event-listeners like you normally would by using the build-in `addEventListener`. But this framework also gives you a convenient function named `listener` to add the event-listener. One advantage is that this function als returns a link which can later be managed by this framework. It takes in an `element` or a `selector`, a `trigger` which are the DOM event triggers like "click", "input", "change" etc. and also a `listener` which will be called whenever the event occurs on the element. 
```html
<button id="counter">Count++</button>
```
```typescript
const count: State<number> = state(0);
const counter = () => {
    count.value++;
}

listener({ selector: "#counter", trigger: "click", listener: counter });
```

## Auto Link
Furthermore it is possible to link your elements automatically. For this you have to call the `autoLink` function which will take in an `element` or a `selector` and an OBJECT with `states` as field. By calling this function the given element is scanned for elements with `data-state-*` elements and will create the links automatically depending on the specific `data-state-*` attribute like this:
```html
<body>
    <span data-state-text="count"></span>
    <button data-state-listener="counter@click">Count++</button>
</body>
```
```typescript
const count: State<number> = state(0);
const counter = () => {
    count.value++;
}

autoLink({ selector: "body", states: { count, counter } });
```

The following `data-state-*` attribute are supported:
- `data-state-text` to create a [textState link](#textstate-link) like you would with the `textState` function. The given value must match one of the state names.
- `data-state-attribute` to create a [attribute link](#attribute-link) like you would with `attributeState` function. Must have the pattern `stateName@attributeName` and then will bind the state with the given state name to the given attribute name. For example: `counter@value` will bind the "counter" state to the "value" attribute.
- `data-state-model` to create a [model link](#model-like) like you would with the `model` function. The given value must match one of the state names.
- `data-state-listener` to create a event-listener. The pattern must be like this `methodName@trigger`, so for example: `counter@click`. The method with the given trigger will automatically bind to the element with the `listener` function you can see [here](#event-listener).
- `data-state-rendered` to create a [render link](#render-link) like you would with the `rendered` function. The given value must match a boolean-typed state with the given name.
- `data-state-foreach` to create a [foreach link](#foreach-link) like you would with the `forEach` function. The pattern must match `iterable@loopValueName` where the first refers to the name of an iterable state and the second is the name of the loop value which you can use with `data-data-*` attributes.
- `data-state-setup` the autoLink version of the `setup` function and is a bit more advanced. See [Setup Function](#setup-function) to read more.

It is possible to pass multiple values to each attribute by using the `;` as a seperator. This is especially necessary for attributes like this `data-state-attribute="widthState@with;heightState@height"`.

## Setup Function
The setup function can be used to scope your states and links to a single element. Sometimes you have a list of elements which all operate the same but need their own independed states and links. In this case you can use the `setup` function. It takes in an `element` or a `selector` and a `setupFunction` which will be called in a scoped context in which all the link functions like `text`, `attribute`, `model` or `rendered` are automatically scoped to the given element of the `setup` function. You can also return an object at the end of the `setup` function which encapsulates states and function which then will be linked with the [`autoLink`](#auto-link) function.
You can use it like this:
```html
<div id="counter1">
    <span data-state-text="count"></span>
    <button data-state-listener="counter@click">Count++</button>
</div>
<div id="counter2">
    <span data-state-text="count"></span>
    <button data-state-listener="counter@click">Count++</button>
</div>
```
```typescript
const counterSetup = () => {
    const count: State<number> = state(0);
    const counter = () => {
        count.value++;
    }
    return {
        count, counter
    }
};

setup({ selector: "#counter1", setupFunction: counterSetup });
setup({ selector: "#counter2", setupFunction: counterSetup });
```

You could also use the `autoLink` function and the `data-state-setup` attribute to achieve the same result without having to call the `setup` function directly.
```html
<div data-state-setup="counterSetup">
    <span data-state-text="count"></span>
    <button data-state-listener="counter@click">Count++</button>
</div>
<div data-state-setup="counterSetup">
    <span data-state-text="count"></span>
    <button data-state-listener="counter@click">Count++</button>
</div>
```
```typescript
const counterSetup = () => {
    const count: State<number> = state(0);
    const counter = () => {
        count.value++;
    }
    return {
        count, counter
    }
};

autoLink({ selector: "body", states: { counterSetup } });
```
## Watch
Sometimes you want to watch state changes and react to them. You can do this by using the `watch` function to create a WatchLink. The `watch` function takes in a `watcher` function which will trigger if one of the given `states` will change.
```typescript
const counter = state(0);
watch(() => {
    console.log(counter.value);
}, counter);
```

## Destroy Function
The `destroy` function takes in an array of links which then will be destroyed. Each type of link has a unique destroy mechanism, but for most of the links it simply means that they will unsubscribe from their given states and no longer update whenever the states update. But some have specially logic like listeners, which also remove themself from the DOM elements. If you want to be sure that a link was cleanly removed call the `destroy` function on a link instance or use this function to destroy multiple links at once.