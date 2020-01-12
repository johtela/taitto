import * as rt from './rect'
import * as pt from './path'

export const ns = 'http://www.w3.org/2000/svg'
export const xlink = 'http://www.w3.org/1999/xlink'

var lastGenId = 0

type ElemType<K extends keyof SVGElementTagNameMap> =
    SVGElementTagNameMap[K] extends SVGGraphicsElement ?
    GraphElem<SVGElementTagNameMap[K]> :
    Elem<SVGElementTagNameMap[K]>

export class Elem<T extends SVGElement> {
    protected elem: T

    constructor(elem: T, parent: Element) {
        this.elem = elem
        parent.appendChild(this.elem)
    }

    get element() {
        return this.elem
    }

    get id() {
        return this.elem.id
    }

    set id(value: string) {
        this.elem.id = value
    }

    get parent() {
        return this.elem.parentElement
    }

    get classes() {
        return this.elem.classList
    }

    get style(): CSSStyleDeclaration {
        return this.elem.style
    }

    get text() {
        return this.elem.textContent
    }

    set text(content: string) {
        this.elem.textContent = content
    }

    addClass(name: string) {
        this.elem.classList.add(name)
        return this
    }

    removeClass(name: string) {
        this.elem.classList.remove(name)
        return this
    }

    toggleClass(name: string) {
        this.elem.classList.toggle(name)
        return this
    }

    attr(name: string): string {
        return this.elem.getAttribute(name)
    }

    attrs(obj: object, namespace: string = null) {
        for (const key in obj)
            if (obj.hasOwnProperty(key)) {
                let val = obj[key];
                if (val instanceof Array)
                    val = val.join(" ");
                this.elem.setAttributeNS(namespace, key, val);
            }
        return this
    }

    child<K extends keyof SVGElementTagNameMap>(tag: K): ElemType<K> {
        let el = this.elem.querySelector(tag)
        return <ElemType<K>>(
            el instanceof SVGGraphicsElement ? new GraphElem(el, this.elem) :
                el instanceof SVGElement ? new Elem(el, this.elem) :
                    null)
    }

    styles(obj: Partial<CSSStyleDeclaration>) {
        for (const key in obj)
            if (obj.hasOwnProperty(key))
                this.elem.style[key] = obj[key]
        return this
    }

    delete() {
        this.elem.parentElement.removeChild(this.elem)
    }

    deleteChildren() {
        while (this.elem.firstChild)
            this.elem.removeChild(this.elem.firstChild)
    }

    moveUnder(parent: Elem<SVGElement>) {
        parent.elem.appendChild(this.elem)
    }

    moveToBack() {
        let parent = this.elem.parentElement
        parent.insertBefore(this.elem, parent.children[0])
        return this
    }

    moveToFront() {
        this.elem.parentElement.appendChild(this.elem)
        return this
    }
}

export class GraphElem<T extends SVGGraphicsElement> extends Elem<T> {
    get bbox() {
        return rt.Rect.fromDOMRect(this.elem.getBBox({ stroke: true }))
    }

    get transform() {
        return this.elem.getCTM() as SVGMatrix
    }

    set transform(mat: SVGMatrix) {
        let tr = this.elem.ownerSVGElement.createSVGTransformFromMatrix(mat)
        this.elem.transform.baseVal.initialize(tr)
    }

    hide() {
        this.styles({ opacity: '0' })
        return this
    }

    show() {
        this.styles({ opacity: '1' })
        return this
    }

    translate(pos: rt.RectPos | [number, number],
        to: [number, number] = [0, 0]) {
        this.transform = this.bbox.translateTo(this.transform, pos, to)
        return this
    }

    clicked(handler: (event: MouseEvent) => void) {
        this.elem.onclick = handler
        return this
    }

    mouseover(handler: (event: MouseEvent) => void) {
        this.elem.onmouseover = handler
        return this 
    }

    mousemove(handler: (event: MouseEvent) => void) {
        this.elem.onmousemove = handler
        return this 
    } 
}

export type SvgElem = SVGElement | Elem<SVGElement>
export type SvgGraphElem = SVGGraphicsElement | GraphElem<SVGGraphicsElement>

export function create<K extends keyof SVGElementTagNameMap>(tag: K,
    parent: Element | Elem<SVGElement>): ElemType<K> {
    let e = document.createElementNS(ns, tag)
    let p = parent instanceof Elem ? parent.element : parent
    return <ElemType<K>>(e instanceof SVGGraphicsElement ?
        new GraphElem(e, p) : new Elem(e, p))
}

export function defs(svgroot: SVGSVGElement | Elem<SVGSVGElement>):
    Elem<SVGDefsElement> {
    return create('defs', svgroot)
}

export function setBounds(svgroot: GraphElem<SVGSVGElement>,
    hmargin: number, vmargin: number = hmargin) {
    let vb = svgroot.bbox.inflate(hmargin, vmargin)
    setViewBox(svgroot, vb)
    svgroot.attrs({ width: vb.width, height: vb.height })
}

export function getViewBox<T extends SVGGraphicsElement & SVGFitToViewBox>(
    elem: GraphElem<T>): rt.Rect {
    return rt.Rect.fromDOMRect(elem.element.viewBox.baseVal)
}

export function setViewBox<T extends SVGGraphicsElement & SVGFitToViewBox>(
    elem: GraphElem<T>, viewBox: rt.Rect) {
    let { left, top, width, height } = viewBox
    elem.attrs({ viewBox: `${left} ${top} ${width} ${height}` })
}

export function css(parent: Elem<SVGSVGElement>): Elem<SVGStyleElement> {
    return parent.child('style') || create('style', parent)
}

export function group(parent: SVGElement | Elem<SVGElement>):
    GraphElem<SVGGElement> {
    return create('g', parent)
}

export function text(parent: SVGElement | Elem<SVGElement>, caption?: string):
    GraphElem<SVGTextElement> {
    let res = create('text', parent)
    if (caption)
        res.text = caption
    return res
}

export function tspan(parent: SVGTextElement | GraphElem<SVGTextElement>,
    caption?: string): GraphElem<SVGTSpanElement> {
    let res = create('tspan', parent)
    if (caption)
        res.text = caption
    return res
}

export function rect(parent: SVGElement | Elem<SVGElement>, x: number, y: number,
    width: number, height: number, rx: number = 0, ry: number = rx):
    GraphElem<SVGRectElement> {
    return create('rect', parent).attrs({ x, y, width, height, rx, ry })
}

export function circle(parent: SVGElement | Elem<SVGElement>, cx: number,
    cy: number, r: number): GraphElem<SVGCircleElement> {
    return create('circle', parent).attrs({ cx, cy, r })
}

export function ellipse(parent: SVGElement | Elem<SVGElement>, cx: number,
    cy: number, rx: number, ry: number): GraphElem<SVGEllipseElement> {
    return create('ellipse', parent).attrs({ cx, cy, rx, ry })
}

export function path(parent: SVGElement | Elem<SVGElement>,
    commands: pt.PathCommand[] | string): GraphElem<SVGPathElement> {
    return create('path', parent).attrs({
        d: typeof commands === 'string' ? commands : commands.join(' ')
    })
}

export function polyline(parent: SVGElement | Elem<SVGElement>,
    points: [number, number][]): GraphElem<SVGPolylineElement> {
    return create('polyline', parent).attrs({ points: points.join(' ') })
}

export function polygon(parent: SVGElement | Elem<SVGElement>,
    points: [number, number][]): GraphElem<SVGPolygonElement> {
    return create('polygon', parent).attrs({ points: points.join(' ') })
}

export function mask(parent: SVGElement | Elem<SVGElement>) {
    let res = create("mask", parent)
    res.id = "mask" + (++lastGenId)
    return res
}

export function link(parent: SVGElement | Elem<SVGElement>,
    href: string): Elem<SVGAElement> {
    return create('a', parent).attrs({ href }, xlink)
}
