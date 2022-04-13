import { autoLink, computed, state, watch } from "../../../../lib/LinkStateJS"

const names = state(['Emil, Hans', 'Mustermann, Max', 'Tisch, Roman'])
const selected = state('')
const prefix = state('')
const first = state('')
const last = state('')

const filteredNames = computed(() =>
    names.value.filter((n) =>
        n.toLowerCase().startsWith(prefix.value.toLowerCase())
    ),
    names,
    prefix
)

watch(() => {
    [last.value, first.value] = selected.value.split(', ')
}, selected)

function create() {
    if (hasValidInput()) {
        const fullName = `${last.value}, ${first.value}`
        if (!names.value.includes(fullName)) {
            names.value.push(fullName)
            first.value = last.value = ''
        }
    }
}

function update() {
    if (hasValidInput() && selected.value) {
        const i = names.value.indexOf(selected.value)
        names.value[i] = selected.value = `${last.value}, ${first.value}`
        names.notify();
    }
}

function del() {
    if (selected.value) {
        const i = names.value.indexOf(selected.value)
        names.value.splice(i, 1)
        selected.value = '';
        first.value = '';
        last.value = '';
    }
}

function hasValidInput() {
    return first.value.trim() && last.value.trim()
}

autoLink({
    selector: "#app",
    states: {
        filteredNames,
        selected,
        prefix,
        first,
        last,
        create,
        update,
        del
    }
});