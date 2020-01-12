import * as el from '../svg/elem'
import * as an from './anim'

export class CustomAnim extends an.Anim {
    constructor(
        target: el.Elem<SVGElement>,
        protected action: (anim: CustomAnim) => void,
        duration: number = 1000) {
        super(target, duration)
    }

    protected run(resolve: (anim: this) => void) {
        this.action(this)
        resolve(this)
    }
}

export function customAnim(target: el.Elem<SVGElement>,
    action: (anim: CustomAnim) => void, duration: number = 1000) {
    return new CustomAnim(target, action, duration)
}