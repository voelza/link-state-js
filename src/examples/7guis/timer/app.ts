import { autoLink, computed, state } from "../../../../lib/LinkStateJS";


const duration = state(15 * 1000)
const durationDisplay = computed(() => (duration.value / 1000).toFixed(1), duration);
const elapsed = state(0);
const elapseDisplay = computed(() => (elapsed.value / 1000).toFixed(1), elapsed);
const progress = computed(() => elapsed.value / duration.value, elapsed, duration);

let lastTime = performance.now()
let handle: number | undefined = undefined;
const update = () => {
    const time = performance.now()
    elapsed.value += Math.min(time - lastTime, duration.value - elapsed.value)
    lastTime = time
    handle = requestAnimationFrame(update)
}

update();

const reset = () => {
    elapsed.value = 0;
}

autoLink({
    selector: "#app",
    states: {
        duration,
        durationDisplay,
        elapsed,
        elapseDisplay,
        progress,
        reset
    }
});