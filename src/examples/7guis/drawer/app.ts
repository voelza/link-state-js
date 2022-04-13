
import { autoLink, computed, LoopSetupInput, state } from "../../../../lib/LinkStateJS";
import State from "../../../../lib/states/State";


const history: State<any> = state([[]])
const index: State<any> = state(0)
const circles: State<any> = state([])
const selected: State<any> = state(null)
const adjusting: State<any> = state(false)

// @ts-ignore: Unreachable code error
function onClick({ clientX: x, clientY: y }) {
    if (adjusting.value) {
        adjusting.value = false
        selected.value = null
        push()
        return
    }
    // @ts-ignore: Unreachable code error
    selected.value = circles.value.find(({ cx, cy, r }) => {
        const dx = cx - x
        const dy = cy - y
        return Math.sqrt(dx * dx + dy * dy) <= r
    })

    if (!selected.value) {
        circles.value.push({
            cx: x,
            cy: y,
            r: 50
        })
        push()
        circles.notify();
    }
}

function adjust(circle: any, e: any) {
    e.preventDefault();
    selected.value = circle
    adjusting.value = true
}

function push() {
    history.value.length = ++index.value
    history.value.push(clone(circles.value))
}

function undo() {
    circles.value = clone(history.value[--index.value])
}

function redo() {
    circles.value = clone(history.value[++index.value])
}

function clone(circles: any) {
    return circles.map((c: any) => ({ ...c }))
}

function setSelected(circle: any) {
    selected.value = circle;
}

const isAtFirstIndex = computed(() => index.value <= 0, index);
const isAtLastIndex = computed(() => index.value >= history.value.length - 1, history, index);

const circleSetup = (input: LoopSetupInput) => {
    const circle = input.states.circle;
    const fillColor = computed(() => circle.value === selected.value ? '#ccc' : '#fff', circle, selected);
    return {
        fillColor
    };
}
autoLink(
    {
        selector: "#app",
        states: {
            setSelected,
            isAtFirstIndex,
            isAtLastIndex,
            history,
            index,
            circles,
            selected,
            adjusting,
            onClick,
            adjust,
            undo,
            redo, circleSetup
        }
    });