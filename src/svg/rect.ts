import * as vec from './vector'

export enum RectPos { Center, TopLeft, TopRight, BottomLeft, BottomRight }

/**
 * Defines a rectangle which covers area [left, right) along x-axis
 * and [top, bottom) along y-axis.
 */
export class Rect {
    readonly left: number
    readonly top: number
    readonly right: number
    readonly bottom: number

    constructor(left: number, top: number, right: number, bottom: number) {
        this.left = left
        this.top = top
        this.right = right
        this.bottom = bottom
    }

    get width() {
        return this.right - this.left
    }

    get height() {
        return this.bottom - this.top
    }

    get centerX() {
        return this.left + (this.width / 2)
    }

    get centerY() {
        return this.top + (this.height / 2)
    }

    get isEmpty() {
        return this.width <= 0 || this.height <= 0
    }

    containsPoint(x: number, y: number) {
        return x >= this.left && x < this.right && 
            y >= this.top && y < this.bottom
    }

    rectPos(pos: RectPos): vec.Vector {
        switch (pos) {
            case RectPos.Center: return [ this.centerX, this.centerY ]
            case RectPos.TopLeft: return [ this.left, this.top ]
            case RectPos.TopRight: return [ this.right, this.top ]
            case RectPos.BottomLeft: return [ this.left, this.bottom ]
            case RectPos.BottomRight: return [ this.right, this.bottom ]
        }
    }

    cornerPoints(closeLoop: boolean = false) {
        let res = [
            this.rectPos(RectPos.TopLeft),
            this.rectPos(RectPos.TopRight),
            this.rectPos(RectPos.BottomRight),
            this.rectPos(RectPos.BottomLeft)
        ]
        if (closeLoop)
            res.push(res[0])
        return res
    }

    containsRect(other: Rect) {
        return other.left >= this.left && other.right <= this.right && 
            other.top >= this.top && other.bottom <= this.bottom
    }

    equals(other: Rect) {
        return this.left == other.left && this.top == other.top &&
            this.width == other.width && this.height == other.height
    }

    inflate(dx: number, dy: number) {
        return new Rect(this.left - dx, this.top - dy, 
            this.right + dx, this.bottom + dy)
    }

    intersect(other: Rect) {
        return new Rect(
            Math.max(this.left, other.left), 
            Math.max(this.top, other.top),
            Math.min(this.right, other.right), 
            Math.min(this.bottom, other.bottom))
    }

    intersectsWith(other: Rect) {
        return !this.intersect(other).isEmpty
    }

    offset(dx: number, dy: number) {
        return new Rect(this.left + dx, this.top + dy,
            this.right + dx, this.bottom + dy)
    }

    translateTo(mat: SVGMatrix, pos: RectPos | [number, number],  
        to: [ number, number] = [ 0, 0 ]): SVGMatrix {
        let [ sx, sy ] = pos instanceof Array ? pos : this.rectPos(pos)
        let [ tx, ty ] = to
        return mat.translate(tx - sx, ty - sy)
    }

    transform(mat: SVGMatrix) {
        return Rect.fromPoints(this.cornerPoints().map(pt => {
            let [ x, y ] = pt        
            let tp = mat.transformPoint({ x, y })
            return [ tp.x, tp.y ]
        }))
    }

    union(other: Rect) {
        return new Rect(
            Math.min(this.left, other.left), 
            Math.min(this.top, other.top),
            Math.max(this.right, other.right), 
            Math.max(this.bottom, other.bottom))
    }

    static fromDOMRect(domRect: DOMRect) {
        return new Rect(domRect.x, domRect.y, 
            domRect.x + domRect.width, domRect.y + domRect.height)
    }

    static fromPoints(points: vec.Vector[]) {
        return new Rect(
            Math.min(...points.map(vec.vecX)),
            Math.min(...points.map(vec.vecY)),
            Math.max(...points.map(vec.vecX)),
            Math.max(...points.map(vec.vecY)))
    }

    static fromRects(rects: Rect[]) {
        return rects.reduce((r, c) => c.union(r))
    }

    static fromString(value: string) {
        let [ left, top, width, height ] = value.split(" ").map(Number)
        return new Rect(left, top, left + width, top + height )
    }
}