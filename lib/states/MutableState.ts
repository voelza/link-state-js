import StateLink from "../links/StateLink";
import State from "./State";

export default class MutableState implements State<any> {
    private _value: any;
    private subscribers: StateLink[] = [];

    constructor(value: any) {
        this._value = value;
        if (this._value instanceof Array) {
            this._value = new Proxy(this._value, {
                get: (target, property, receiver) => {
                    const result = Reflect.get(target, property, receiver);
                    if (
                        property === "push"
                        || property === "shift"
                        || property === "unshift"
                        || property === "pop"
                        || property === "sort") {
                        return (...args: any[]) => {
                            target[property](...args);
                            this.notify();
                        };
                    } else if (property === "splice") {
                        return (pos: number, amount: number) => {
                            target[property](pos, amount);
                            this.notify();
                        };
                    }
                    return result;
                },
            });
        } else if (this._value instanceof Object) {
            this._value = new Proxy(this._value, {
                set: (target, property, value, receiver): boolean => {
                    const result = Reflect.set(target, property, value, receiver);
                    this.notify();
                    return result;
                },
            });
        }
    }

    set value(newValue: any) {
        this.set(newValue);
    }

    get value(): any {
        return this._value;
    }

    set(newValue: any): void {
        if (this._value !== newValue) {
            this._value = newValue;
            this.notify();
        }
    }

    setPathValue(keyPath: string, newValue: any): void {
        this._value.setValueForKeyPath(keyPath, newValue);
        this.notify();
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

    notify(): void {
        for (const subscriber of this.subscribers) {
            subscriber.update();
        }
    }
}