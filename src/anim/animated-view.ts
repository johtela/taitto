import * as rt from '../svg/rect'
import * as el from '../svg/elem'
import * as ad from './animated'
import * as kfa from './keyframe-anim'

export class AnimatedView extends ad.Animated {
    svgparent: el.GraphElem<SVGSVGElement>

    constructor(parent: el.GraphElem<SVGSVGElement>) {
        super(parent.element)
        this.svgparent = parent
    }

    get parentVBox(): rt.Rect {
        return el.getViewBox(this.svgparent)
    }

    zoom(to: rt.Rect, duration: number = 1000) {
        let vbox = this.parentVBox
        let scale = Math.min(vbox.width / to.width, vbox.height / to.height)
        let x = vbox.left - to.left
        let y = vbox.top - to.top
        return new kfa.KeyframeAnim(this, [ad.current, a => 
            a.state.scale(scale, scale).move(x, y)], duration)
    }

    zoomFactor(scale: number, x: number, y: number, duration: number = 1000) {
        let vbox = this.parentVBox
        let sx = vbox.centerX - x
        let sy = vbox.centerY - y
        return new kfa.KeyframeAnim(this, [ad.current, a => 
            a.state.scale(scale, scale).move(sx, sy)], duration)
    }

    zoomHome(duration: number = 1000) {
        return new kfa.KeyframeAnim(this, [ad.current, a => 
            a.state.scale(1, 1).move(0, 0)], duration)
    }

    pan(x: number, y: number, duration: number = 1000) {
        return new kfa.KeyframeAnim(this, [ad.current,
            ad.moveRelative(-x, -y)], duration)
    }

    panTo(x: number, y: number, duration: number = 1000) {
        return new kfa.KeyframeAnim(this, [ad.current, ad.move(x, y)], duration)
    }
}

export function animatedView(parent: el.GraphElem<SVGSVGElement>) {
    return new AnimatedView(parent)
}

