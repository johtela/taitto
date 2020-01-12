import * as el from './elem'
import * as rt from './rect'

export function wordWrapText(parent: SVGElement | el.Elem<SVGElement>,
    x: number, y: number, wrapAfter: number, caption: string) {
    let text = el.text(parent).attrs({ x, y, "data-wrapAfter": wrapAfter })
    changeWordWrapText(text, caption)
    return text
}

export function changeWordWrapText(text: el.GraphElem<SVGTextElement>, 
    caption: string, x?: number, wrapAfter?: number) {
    text.deleteChildren()
    let words = caption.split(" ")
    if (x)
        text.attrs({ x })
    else
        x = Number(text.attr("x"))
    if (wrapAfter)
        text.attrs({ "data-wrapAfter": wrapAfter })
    else
        wrapAfter = Number(text.attr("data-wrapAfter") || 100)
    let i = 0
    let bb: rt.Rect = null
    while (i < words.length) {
        let ts = el.tspan(text, words[i])
        let w = ts.element.getComputedTextLength()
        while (++i < words.length && w < wrapAfter) {
            ts.text = ts.text + " " + words[i]
            w = ts.element.getComputedTextLength()
        }
        if (!bb)
            bb = text.bbox
        else
            ts.attrs({ x, dy: bb.height })
    }    
}