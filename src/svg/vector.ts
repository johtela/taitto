export type Vector = [ number, number ]

export const zeroVector: Vector = [0, 0]
export const oneVector: Vector = [1, 1]

export function vecX(vec: Vector) {
    return vec[0]
}

export function vecY(vec: Vector) {
    return vec[1]
}

export function addVec(vec1: Vector, vec2: Vector) {
    return vec1.map((a, i) => a + vec2[i])
}

export function subVec(vec1: Vector, vec2: Vector) {
    return vec1.map((a, i) => a - vec2[i])
}

export function mulVec(vec1: Vector, vec2: Vector) {
    return vec1.map((a, i) => a * vec2[i])
}

export function divVec(vec1: Vector, vec2: Vector) {
    return vec1.map((a, i) => a / vec2[i])
}