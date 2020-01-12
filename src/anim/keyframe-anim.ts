import * as el from '../svg/elem'
import * as vec from '../svg/vector'
import * as ad from './animated'
import * as an from './anim'

export class KeyframeAnim extends an.Anim {
    protected stopEvent: string

    constructor(
        target: el.Elem<SVGElement>,
        protected keyframes: (Keyframe | ad.GetAnimState)[],
        duration: number = 1000,
        public fill: FillMode = "both",
        public direction: PlaybackDirection = "normal",
        public iterations: number = 1) {
        super(target, duration)
    }

    stopOn(event: string) {
        this.stopEvent = event
        return this
    }

    private getKeyframe(kf: Keyframe | ad.GetAnimState) {
        if (typeof kf === 'function') {
            if (!(this.target instanceof ad.Animated))
                throw Error("Target not of type Animated")
            let state = kf(this.target)
            this.target.state = state
            return state.toKeyframe()
        }
        return kf
    }

    protected run(resolve: (anim: this) => void) {
        let a = this.target.element.animate(
            this.keyframes.map(kf => this.getKeyframe(kf)),
            {
                duration: this.duration,
                fill: this.fill,
                direction: this.direction,
                iterations: this.iterations
            })
        a.onfinish = () => resolve(this)
        a.oncancel = () => resolve(this)
        if (this.stopEvent)
            this.target.element.addEventListener(this.stopEvent, 
                () => a.cancel())
    }
}

export function invisible(): Keyframe { return { opacity: 0 } }
export function visible(): Keyframe { return { opacity: 1 } }

export function slideTo(elem: ad.Animated, pos: vec.Vector, 
    duration: number = 1000) {
    let [x, y] = pos
    return new KeyframeAnim(elem, [ad.current, ad.move(x, y)], duration)
}

function createSlideIn(move: ad.TransformState, bounce: ad.Pulsator) {
    return (elem: el.GraphElem<SVGGraphicsElement>,
        distance: number = 1, duration: number = 1000) => {
        let kfs = [move(distance), move(0)].concat(bounce(2))
        kfs[1] = ad.offset(kfs[1], 0.5 + Math.min(duration / 10000, 0.5))
        return new KeyframeAnim(elem, kfs, duration)
    }
}

function createSlideOut(move: ad.TransformState) {
    return (elem: el.GraphElem<SVGGraphicsElement>,
        distance: number = 1, duration: number = 1000) => {
        let kfs = ([move(0), move(-distance / 20), move(distance)])
        kfs[1] = ad.offset(kfs[1], 0.2)
        return new KeyframeAnim(elem, kfs, duration)
    }
}

export const slideInLeft = createSlideIn(ad.shiftLeft, ad.bounceLeft)
export const slideInRight = createSlideIn(ad.shiftRight, ad.bounceRight)
export const slideInTop = createSlideIn(ad.shiftUp, ad.bounceUp)
export const slideInBottom = createSlideIn(ad.shiftDown, ad.bounceDown)
export const slideOutLeft = createSlideOut(ad.shiftLeft)
export const slideOutRight = createSlideOut(ad.shiftRight)
export const slideOutTop = createSlideOut(ad.shiftUp)
export const slideOutBottom = createSlideOut(ad.shiftDown)

export function zoomIn(elem: el.GraphElem<SVGGraphicsElement>,
    duration: number = 1000) {
    let kfs = [ad.scaleXY(0), ad.scaleXY(1)].concat(ad.wobbleXY(2))
    kfs[1] = ad.offset(kfs[1], 0.5 + Math.min(duration / 10000, 0.5))
    return new KeyframeAnim(elem, kfs, duration)
}

export function fadeIn(elem: el.GraphElem<SVGGraphicsElement>,
    duration: number = 1000) {
    return new KeyframeAnim(elem, [invisible(), visible()], duration)
}

export function fadeOut(elem: el.GraphElem<SVGGraphicsElement>,
    duration: number = 1000) {
    return new KeyframeAnim(elem, [visible(), invisible()], duration)
}

export function fadeInOut(elem: el.GraphElem<SVGGraphicsElement>,
    duration: number = 1000, iterations: number = 1) {
    return new KeyframeAnim(elem, [invisible(), visible()], duration, "auto",
        "alternate", iterations * 2)
}

function semiCirclePositions(count: number, radius: number) {
    let res = new Array<vec.Vector>(count)
    let angle = Math.PI / (count + 1)
    for (let i = 0; i < count; i++) {
        let x = -Math.cos((i + 1) * angle) * radius
        let y = -Math.sin((i + 1) * angle) * radius
        res[i] = [x, y]
    }
    return res
}

export function spreadAround(elems: el.GraphElem<SVGGraphicsElement>[],
    radius: number, duration: number): KeyframeAnim[] {
    let pos = semiCirclePositions(elems.length, radius)
    return elems.map((e, i) => {
        let [x, y] = pos[i]
        return new KeyframeAnim(e, [ad.moveRelative(0, 0), ad.moveRelative(x, y)], 
            duration)
    })
}