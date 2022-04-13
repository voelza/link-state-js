import { autoLink, state } from "../../../../lib/LinkStateJS";
import State from "../../../../lib/states/State";
import cellSetup from "./cell";
import { cells } from "./store";

const cols = state(cells.value.map((_: any, i: number) => String.fromCharCode(65 + i)));
const colsLengthAsArray: State<Number[]> = state([]);
for (let i = 0; i < cells.value[0].length; i++) {
    colsLengthAsArray.value.push(i);
}

autoLink({ selector: "#app", states: { cols, colsLengthAsArray, cells, cellSetup } });