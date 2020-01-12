/**
 * # Animating SVG Elements
 */
import * as el from '../svg/elem'
import * as vec from '../svg/vector'

export class AnimState {
    static readonly zero = new AnimState(vec.oneVector, 0, vec.zeroVector,
        vec.zeroVector)
    public offset?: number

    constructor(
        readonly scaling: vec.Vector,
        readonly rotation: number,
        readonly position: vec.Vector,
        readonly shift: vec.Vector) { }

    scale(x: number, y: number) {
        return new AnimState([x, y], this.rotation, this.position, this.shift)
    }

    rotate(angle: number) {
        return new AnimState(this.scaling, angle, this.position, this.shift)
    }

    move(x: number, y: number) {
        return new AnimState(this.scaling, this.rotation, [x, y], this.shift)
    }

    moveRelative(dx: number, dy: number) {
        let [x, y] = this.position
        return new AnimState(this.scaling, this.rotation, [x + dx, y + dy],
            this.shift)
    }

    shiftPosition(x: number, y: number) {
        return new AnimState(this.scaling, this.rotation, this.position,
            [x, y])
    }

    get matrix() {
        let [sx, sy] = this.scaling
        let [x, y] = vec.addVec(this.position, this.shift)
        return new DOMMatrix()
            .scale(sx, sy)
            .rotate(0, 0, this.rotation)
            .translate(x, y)
    }

    toKeyframe(): Keyframe {
        let [sx, sy] = this.scaling
        let [x, y] = vec.addVec(this.position, this.shift)
        return {
            transform:
                `rotateZ(${this.rotation}deg) ` +
                `translate3d(${x}px, ${y}px, 0) ` +
                `scale3d(${sx}, ${sy}, 1)`,
            offset: this.offset
        }
    }
}

export class Animated extends el.GraphElem<SVGGElement> {
    state = AnimState.zero

    constructor(parent: Element) {
        super(document.createElementNS(el.ns, 'g'), parent)
        this.styles({
            transformOrigin: 'center',
            transformBox: 'fill-box'
        })
    }

    get animatedBBox() {
        return this.bbox.transform(this.state.matrix)
    }

    position(pos: vec.Vector) {
        let [x, y] = pos
        this.state = this.state.move(x, y)
        return this
    }
}

export type GetAnimState = (a: Animated) => AnimState
export type Pulsator = (times?: number, amplitude?: number) => GetAnimState[]

export function animated(parent: el.SvgElem): Animated {
    return new Animated(parent instanceof el.Elem ? parent.element : parent)
}

export function offset(getState: GetAnimState, offset: number): GetAnimState {
    return a => {
        let state = getState(a)
        state.offset = offset
        return state
    }
}

export const reset: GetAnimState = a => new AnimState([1, 1], 0, [0, 0], [0, 0])
export const current: GetAnimState = a => a.state
export const zeroSize: GetAnimState = a => a.state.scale(0, 0)
export const normalSize: GetAnimState = a => a.state.scale(1, 1)

export type TransformState = (value: number) => GetAnimState

export function move(x: number, y: number): GetAnimState {
    return a => a.state.move(x, y)
}

export function moveRelative(x: number, y: number): GetAnimState {
    return a => a.state.moveRelative(x, y)
}

export function shift(x: number, y: number): GetAnimState {
    return a => a.state.shiftPosition(x, y)
}

export function shiftLeft(dist: number): GetAnimState {
    return a => a.state.shiftPosition(-dist * 100, 0)
}

export function shiftRight(dist: number): GetAnimState {
    return a => a.state.shiftPosition(dist * 100, 0)
}

export function shiftUp(dist: number): GetAnimState {
    return a => a.state.shiftPosition(0, -dist * 100)
}

export function shiftDown(dist: number): GetAnimState {
    return a => a.state.shiftPosition(0, dist * 100)
}

export function scaleX(scale: number): GetAnimState {
    return a => a.state.scale(scale, 1)
}

export function scaleY(scale: number): GetAnimState {
    return a => a.state.scale(1, scale)
}

export function scaleXY(scale: number): GetAnimState {
    return a => a.state.scale(scale, scale)
}

function* pulsate(times: number, amplitude: number) {
    times *= 2
    for (let i = 0; i < times; i++)
        yield i % 2 == 1 ? 1 : (1 - amplitude) + ((i / times) * amplitude)
}

function pulsateTransform(times: number, amplitude: number,
    transform: TransformState): GetAnimState[] {
    return Array.from(pulsate(times, amplitude)).map(transform)
}

function oneMinus(transform: TransformState): TransformState {
    return scale => transform(1 - scale)
}

function createPulsator(transform: TransformState): Pulsator {
    return (times: number = 5, amplitude: number = times / 10) =>
        pulsateTransform(times, amplitude, transform)
}

export const wobbleX = createPulsator(scaleX)
export const wobbleY = createPulsator(scaleY)
export const wobbleXY = createPulsator(scaleXY)
export const bounceLeft = createPulsator(oneMinus(shiftLeft))
export const bounceRight = createPulsator(oneMinus(shiftRight))
export const bounceUp = createPulsator(oneMinus(shiftUp))
export const bounceDown = createPulsator(oneMinus(shiftDown))
