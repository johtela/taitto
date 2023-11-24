import * as svg from './svg'
import * as anim from './anim'

interface IconDimensions {
    width: number
    height: number
    radius: number
}

export interface FolderIcon extends svg.GraphElem<SVGGElement> { 
    open: anim.KeyframeAnim 
    close: anim.KeyframeAnim 
}

export const folderDimensions: IconDimensions = {
    width: 80,
    height: 60,
    radius: 4
}

export const fileDimensions: IconDimensions = {
    width: 60,
    height: 80,
    radius: 4
}

export const terminalDimensions: IconDimensions = {
    width: 100,
    height: 80,
    radius: 4
}

export interface TerminalIcon extends svg.GraphElem<SVGGraphicsElement> {
    setCaption(caption: string): anim.CustomAnim[]
}

function container3D(parent: svg.Elem<SVGElement>) {
    return svg.group(parent).addClass("container3D");
}

function iconRect(parent: svg.Elem<SVGElement>, dims: IconDimensions) {
    let x = dims.width / 2
    let y = dims.height / 2
    return svg.rect(parent, -x, -y, dims.width, dims.height, dims.radius)
}

export function folder(parent: svg.GraphElem<SVGGraphicsElement>,
    caption: string, dims: IconDimensions = folderDimensions): FolderIcon {
    let res: FolderIcon = container3D(parent) as FolderIcon
    let back = svg.group(res).addClass("folder-back")
    iconRect(back, dims)
    let x = dims.width / 2
    let y = dims.height / 2
    let tw = 0.30 * dims.width
    let th = 0.25 * dims.height
    svg.rect(back, -x, -y - (th / 2), tw, th, dims.radius)
    let front = svg.group(res).addClass("folder-front")
        .styles({
            transformOrigin: `${x}px ${y}px`
        })
    iconRect(front, dims)
    svg.text(front, caption).translate(svg.RectPos.Center)
    let kfs = [
        { transform: 'rotateX(0deg)' },
        { transform: 'rotateX(30deg)' }
    ]
    res.open = new anim.KeyframeAnim(front, kfs, 200)
    res.close = new anim.KeyframeAnim(front, kfs.slice().reverse(), 200)
    return res
}

function docLines(dims: IconDimensions): svg.PathCommand[] {
    let w = dims.width - 20
    let h = dims.height - 20
    let res: svg.PathCommand[] = []
    for (let y = 0; y < h; y += 5) {
        if (Math.random() > 0.2) {
            res.push(new svg.MoveTo("M", 0, y))
            res.push(new svg.HLineTo("h", w - (Math.random() * 5)))
        }
    }
    return res
}

export function file(parent: svg.GraphElem<SVGGraphicsElement>,
    typeStr: string, caption: string, dims: IconDimensions = fileDimensions) {
    let container = container3D(parent)
    let doc = svg.group(container).addClass("document")
    let mask = svg.mask(doc)
    iconRect(mask, dims).attrs({
        fill: "white",
        stroke: "white"
    })
    let mw = dims.width / 2
    let mh = dims.height / 2
    let fsize = mw / 2
    svg.path(mask, `M0 -1 h${mw} v${mw} z`).attrs({
        transform: `translate(${fsize} ${-mh})`,
        fill: "black",
        stroke: "black"
    })
    let group = svg.group(doc).attrs({
        mask: `url(#${mask.id})`
    })
    iconRect(group, dims)
    svg.path(group, docLines(dims)).attrs({
        "stroke-width": 2
    })
        .translate(svg.RectPos.Center)
    svg.text(group, typeStr).addClass("doc-bg")
    svg.rect(group, fsize, -mh, fsize, fsize, dims.radius / 2)
    svg.text(doc, caption).addClass("doc-text")
        .translate(svg.RectPos.Center, [0, fsize])
    return container
}

function titleButton(parent: svg.GraphElem<SVGGraphicsElement>,
    x: number, y: number, th: number) {
    let bd = th / 2
    let br = th / 4
    return svg.ellipse(parent, x - bd, -y + bd, br, br)
}

export function terminal(parent: svg.GraphElem<SVGGraphicsElement>,
    caption: string, dims: IconDimensions = terminalDimensions): TerminalIcon {
    let container = container3D(parent) as TerminalIcon
    let term = svg.group(container).addClass("terminal")
    iconRect(term, dims)
    let x = dims.width / 2
    let y = dims.height / 2
    let th = dims.height / 8
    svg.rect(term, -x, -y, dims.width, th, dims.radius / 2)
        .addClass("title-bar")
    let sp = th * 0.75
    titleButton(term, x, y, th)
    titleButton(term, x - sp, y, th)
    titleButton(term, x - (sp * 2), y, th)
    caption = ">" + caption + "_"
    let text = svg.text(term, caption).addClass("terminal-text")
        .translate(svg.RectPos.Center)
    container.setCaption = value =>
        Array.from({ length: value.length + 1})
            .map((_, i) => anim.customAnim(text, a =>
                a.target.text = ">" + value.slice(0, i) + "_", 0))
    return container
}

export function fileDiagram(parent: HTMLElement, width: number, height: number):
    svg.GraphElem<SVGSVGElement> {
    let vb = new svg.Rect(0, 0, width, height)
    let res = svg.create('svg', parent).addClass("file-diagram")
    svg.setViewBox(res, vb)
    return res
}