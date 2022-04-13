import { autoLink, computed, state } from "../../../../lib/LinkStateJS";

const flightType = state('one-way flight')
const departureDate = state(dateToString(new Date()))
const returnDate = state(departureDate.value)

const isReturn = computed(() => flightType.value === 'return flight', flightType);
const isNotReturn = computed(() => !isReturn.value, isReturn);


const canBook = computed(
    () =>
        !isReturn.value ||
        stringToDate(returnDate.value) > stringToDate(departureDate.value),
    isReturn, returnDate, departureDate
);

const cantBook = computed(() => !canBook.value, canBook);


function book() {
    alert(
        isReturn.value
            ? `You have booked a return flight leaving on ${departureDate.value} and returning on ${returnDate.value}.`
            : `You have booked a one-way flight leaving on ${departureDate.value}.`
    )
}

function stringToDate(str: any) {
    const [y, m, d] = str.split('-')
    return new Date(+y, m - 1, +d)
}

function dateToString(date: Date) {
    return (
        date.getFullYear() +
        '-' +
        pad(date.getMonth() + 1) +
        '-' +
        pad(date.getDate())
    )
}

function pad(n: any, s = String(n)) {
    return s.length < 2 ? `0${s}` : s
}

const cantBookError = computed(() => cantBook.value ? "Return date must be after departure date." : "", cantBook);


autoLink({
    selector: "#app",
    states: {
        flightType,
        departureDate,
        returnDate,
        isReturn,
        isNotReturn,
        canBook,
        cantBook,
        book,
        cantBookError
    }
});