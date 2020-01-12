import * as svg from './svg'
import * as anim from './anim'
import * as dagre from 'dagre'

export interface Node {
    name: string
    label: string
    link?: string
    elem?: svg.GraphElem<SVGGraphicsElement>
    shape?: (parent: svg.Elem<SVGElement>, x: number, y: number,
        width: number, height: number) => svg.Elem<SVGElement>
}

export enum ArrowPos { Source, Destination }

export interface Arrow {
    closed: boolean;
    positions: ArrowPos[]
    width: number
    length: number
    className: string
    elem?: svg.Elem<SVGMarkerElement>
}

export interface Edge {
    source: Node
    destination: Node
    label?: string
    elem?: svg.GraphElem<SVGGraphicsElement>
    arrow?: Arrow
}

export interface Digraph {
    nodes: Node[]
    edges: Edge[]
    direction?: 'TB' | 'BT' | 'LR' | 'RL'
    margin?: number
    nodeMargin?: number
    edgeLabelPos?: 'l' | 'c' | 'r'
    curvedEdges?: boolean
    nodesep?: number
    ranksep?: number
}

const defaultNodesep = 16
const defaultRanksep = 16

export type NodeDef = string | [string, string]
export type EdgeDef = [Node, Node] | [Node, Node, string]

export function nodes(...nodes: NodeDef[]): Node[] {
    return nodes.map(n => {
        return typeof (n) == 'string' ?
            { name: n, label: n } :
            { name: n[0], label: n[1] }
    })
}

export function edges(edges: EdgeDef[], arrow?: Arrow): Edge[] {
    return edges.map(e => {
        return e.length < 3 ?
            { arrow, source: e[0], destination: e[1] } :
            { arrow, source: e[0], destination: e[1], label: e[2] }
    })
}

function drawNode(node: Node, parent: svg.GraphElem<SVGGElement>,
    margin: number = 10) {
    let group = svg.group(parent)
    let p = node.link ? svg.link(group, node.link) : group
    let text = svg.text(p, node.label)
    let bb = text.bbox.inflate(margin, margin)
    let shape = node.shape || svg.rect
    shape(p, bb.left, bb.top, bb.width, bb.height).moveToBack()
    group.translate(svg.RectPos.Center)
    node.elem = group.addClass("node")
}

function drawEdgeLabel(edge: Edge, parent: svg.GraphElem<SVGGElement>) {
    let text = svg.text(parent, edge.label)
    text.translate(svg.RectPos.Center)
    edge.elem = text.addClass("edgelabel")
}

function addArrow(arrow: Arrow, svgroot: svg.GraphElem<SVGSVGElement>,
    path: svg.GraphElem<SVGPathElement>) {
    if (!arrow.elem)
        arrow.elem = svg.arrow(svgroot.child('defs'), arrow.width, arrow.length,
            arrow.closed).addClass(arrow.className);
    if (arrow.positions.includes(ArrowPos.Source))
        svg.setMarker(path, arrow.elem, svg.MarkerPos.Start);
    if (arrow.positions.includes(ArrowPos.Destination))
        svg.setMarker(path, arrow.elem, svg.MarkerPos.End);
}

type Point = { x: number, y: number }

function dist(pt1: Point, pt2: Point): number {
    let dx = pt1.x - pt2.x
    let dy = pt1.y - pt2.y
    return Math.sqrt(dx * dx + dy * dy)
}

function drawEdge(edge: dagre.GraphEdge, svgroot: svg.GraphElem<SVGSVGElement>,
    parent: svg.GraphElem<SVGGElement>, arrow: Arrow, curvedEdges: boolean,
    ranksep: number) {
    let p = edge.points
    let cmds: svg.PathCommand[] = [new svg.MoveTo('M', p[0].x, p[0].y)]
    let len = p.length
    let i = 1
    while (i < len)
        if (!curvedEdges ||
            (len <= 3 && (i == len - 1 || dist(p[i], p[i + 1]) < ranksep))) {
            cmds.push(new svg.LineTo('L', p[i].x, p[i].y))
            i++
        }
        else if (i < len - 1) {
            cmds.push(new svg.ContCubicCurveTo('S', p[i].x, p[i].y,
                p[i + 1].x, p[i + 1].y))
            i += 2
        }
        else {
            cmds.push(new svg.ContQuadCurveTo('T', p[i].x, p[i].y))
            i++
        }
    let res = svg.path(parent, cmds).addClass("edge")
    if (arrow)
        addArrow(arrow, svgroot, res);
    return res.moveToBack()
}

function defineDigraph(digraph: Digraph, svgroot: svg.GraphElem<SVGSVGElement>,
    viewport: svg.GraphElem<SVGGElement>, dg: dagre.graphlib.Graph) {
    digraph.nodes.forEach(node => {
        drawNode(node, viewport, digraph.nodeMargin)
        let bbox = node.elem.bbox
        dg.setNode(node.name, {
            label: node.label,
            width: bbox.width,
            height: bbox.height
        })
    })
    digraph.edges.forEach(edge => {
        if (edge.label) {
            drawEdgeLabel(edge, viewport)
            let { width, height } = edge.elem.bbox
            dg.setEdge(edge.source.name, edge.destination.name, {
                label: edge.label,
                labelpos: digraph.edgeLabelPos || 'r',
                width, height
            })
        }
        else
            dg.setEdge(edge.source.name, edge.destination.name)
    })
}

function layoutDigraph(digraph: Digraph, svgroot: svg.GraphElem<SVGSVGElement>,
    viewport: svg.GraphElem<SVGGElement>, dg: dagre.graphlib.Graph) {
    digraph.nodes.forEach(node => {
        let dn = dg.node(node.name)
        let e = node.elem
        e.transform = e.transform.translate(dn.x, dn.y)
    })
    digraph.edges.forEach(edge => {
        let de = dg.edge(edge.source.name, edge.destination.name)
        drawEdge(de, svgroot, viewport, edge.arrow, digraph.curvedEdges,
            digraph.ranksep || defaultRanksep)
        let e = edge.elem
        if (e)
            e.transform = e.transform.translate(de.x, de.y)
    })
}

function createDigraph(digraph: Digraph, parent: HTMLElement) {
    let svgroot = svg.create('svg', parent).addClass("digraph")
        .styles({ cursor: "zoom-in" })
    svg.defs(svgroot)
    let graph = new dagre.graphlib.Graph()
    graph.setGraph({
        rankdir: digraph.direction || 'TB',
        nodesep: digraph.nodesep || defaultNodesep,
        ranksep: digraph.ranksep || defaultRanksep
    })
    graph.setDefaultEdgeLabel((v: string, w: string) => { return {} })
    let viewport = anim.animatedView(svgroot).styles({ cursor: "zoom-in" })
    defineDigraph(digraph, svgroot, viewport, graph)
    dagre.layout(graph)
    layoutDigraph(digraph, svgroot, viewport, graph)
    svg.setBounds(svgroot, digraph.margin || 10)
    return svgroot.clicked(e => zoomInOut(svgroot, viewport, e))
}

let zoomed = false
const zoomSpeed = 300

function zoomInOut(svgroot: svg.GraphElem<SVGSVGElement>,
    viewport: anim.AnimatedView, event: MouseEvent) {
    let zoomAnim: anim.KeyframeAnim = null
    if (!zoomed) {
        let s = svgroot.element
        let pt = s.createSVGPoint()
        pt.x = event.clientX
        pt.y = event.clientY
        let { x, y } = pt.matrixTransform(s.getScreenCTM().inverse())
        zoomAnim = viewport.zoomFactor(2, x, y, zoomSpeed)
    }
    else
        zoomAnim = viewport.zoomHome(zoomSpeed)
    zoomed = !zoomed
    svgroot.styles({ cursor: zoomed ? "zoom-out" : "zoom-in" })
    new anim.AnimSequence().addAt(zoomAnim, 0).play()
}

export function digraph(dg: Digraph, parent: HTMLElement) {
    let svgroot: svg.GraphElem<SVGSVGElement> = null
    if (!document.fonts || document.fonts.status == "loaded")
        svgroot = createDigraph(dg, parent)
    else
        document.fonts.onloadingdone = () => {
            if (svgroot)
                svgroot.delete()
            svgroot = createDigraph(dg, parent)
        }
}