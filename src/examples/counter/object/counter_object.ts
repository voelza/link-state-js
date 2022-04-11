import { listener, state, text } from "../../../../lib/LinkStateJS";

const count = state({ count: 0 });
const counter = () => {
    count.value["count"]++;
}

text({ element: document.getElementById("count")!, text: () => `${count.value.count}`, states: [count] });
listener({ element: document.getElementById("counter")!, trigger: "click", listener: counter });