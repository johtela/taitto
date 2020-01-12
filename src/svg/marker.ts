import * as el from './elem'

export enum MarkerPos { Start, Mid, End }

type MarkerTarget = SVGPathElement | SVGLineElement | SVGPolylineElement |
    SVGPolygonElement

var lastId = 0

export function marker(parent: SVGDefsElement | el.Elem<SVGDefsElement>, 
    id: string): el.Elem<SVGMarkerElement> {
    return el.create('marker', parent).attrs({ id })
}

export function setMarker(elem: el.GraphElem<MarkerTarget>,
    marker: el.Elem<SVGMarkerElement> | string, pos: MarkerPos) {
    let markerUrl = `url(#${typeof marker === 'string' ? marker : marker.id})` 
    switch (pos) {
        case MarkerPos.Start:
            return elem.attrs({ "marker-start": markerUrl })
        case MarkerPos.Mid:
            return elem.attrs({ "marker-mid": markerUrl })
        case MarkerPos.End:
            return elem.attrs({ "marker-end": markerUrl })
    }
    return elem
}

export function arrow(parent: SVGDefsElement | el.Elem<SVGDefsElement>, 
    width: number, length: number = width, closed = true): 
    el.Elem<SVGMarkerElement> {
    let res = marker(parent, "arrow" + ++lastId).attrs({
        viewBox: "-1 -1 12 12",
        refX: 10, refY: 5,
        orient: "auto-start-reverse",
        markerWidth: length, markerHeight: width,
        preserveAspectRatio: "none"
    })
    el.path(res, "M 0 0 L 10 5 L 0 10" + (closed ? " z" : ""))
    return res
}