import * as el from './elem'

var lastId = 0

export function filter(parent: SVGDefsElement | el.Elem<SVGDefsElement>,
    id: string): el.Elem<SVGFilterElement> {
    return el.create('filter', parent).attrs({ id })
}

export function setFilter(elem: el.GraphElem<SVGGraphicsElement>,
    filter: el.Elem<SVGFilterElement> | string) {
    elem.attrs({ filter: `url(#${typeof filter === 'string' ? 
        filter : filter.id})`})
    return elem
}

export function shadow(parent: SVGDefsElement | el.Elem<SVGDefsElement>,
    dx: number, dy = dx, stdDeviation = dx) {
    let res = filter(parent, "filter" + ++lastId)
    el.create('feOffset', res).attrs({ 
        result: 'offOut', in: 'sourceGraphic', dx: 4, dy: 4 })
    el.create('feBlend', res).attrs({ 
        in: 'sourceGraphic', in2: 'offOut', mode: 'normal' })
    return res
}
