import { autoLink, state } from "../../../../lib/LinkStateJS";


const celsius = state(0);
const fahrenheit = state(32);
function setCelsius(event: any) {
    const val = event.target.value;
    celsius.value = (val - 32) * (5 / 9);
}

function setFahrenheit(event: any) {
    const val = event.target.value;
    fahrenheit.value = val * (9 / 5) + 32
}

autoLink({ selector: "#app", states: { celsius, fahrenheit, setCelsius, setFahrenheit } });