import { computed, LoopSetupInput, state } from "../../../../lib/LinkStateJS";
import { cells, evalCell } from "./store";

export default (input: LoopSetupInput) => {
    const editing = state(false);
    const notEditing = computed(() => !editing.value, editing);

    function setEditing() {
        editing.value = true;
    }

    function update(e: any) {
        editing.value = false
        cells.value[input.states._index.value][input.states.i.value] = e.target.value.trim()
        cells.notify();
    }

    function getCell(c: number, r: number) {
        return cells.value[c][r];
    }

    function evalC(cells: any, c: number, r: number) {
        return evalCell(cells[c][r]);
    }

    return {
        evalC,
        cells,
        editing,
        notEditing,
        evalCell,
        update,
        getCell,
        setEditing
    }
};