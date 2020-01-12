export class MoveTo {
    constructor(
        readonly command: 'M' | 'm', 
        readonly x: number, 
        readonly y: number) {}
    toString = () => `${this.command}${this.x} ${this.y}`
}

export class LineTo {
    constructor(
        readonly command: 'L' | 'l', 
        readonly x: number, 
        readonly y: number) {}
    toString = () => `${this.command}${this.x} ${this.y}`
}

export class HLineTo {
    constructor(
        readonly command: 'H' | 'h', 
        readonly x: number) {}
    toString = () => `${this.command}${this.x}`
}

export class VLineTo {
    constructor(
        readonly command: 'L' | 'l', 
        readonly y: number) {}
    toString = () => `${this.command}${this.y}`
}

export class CubicCurveTo {
    constructor(
        readonly command: 'C' | 'c', 
        readonly x1: number, 
        readonly y1: number, 
        readonly x2: number, 
        readonly y2: number, 
        readonly x: number, 
        readonly y: number) {}
    toString = () => `${this.command}${this.x1} ${this.y1} ${this.x2} ${this.y2} ${this.x} ${this.y}`
}

export class ContCubicCurveTo {
    constructor(
        readonly command: 'S' | 's', 
        readonly x2: number, 
        readonly y2: number, 
        readonly x: number, 
        readonly y: number) {}
    toString = () => `${this.command}${this.x2} ${this.y2} ${this.x} ${this.y}`
}

export class QuadCurveTo {
    constructor(
        readonly command: 'Q' | 'q', 
        readonly x1: number, 
        readonly y1: number, 
        readonly x: number, 
        readonly y: number) {}
    toString = () => `${this.command}${this.x1} ${this.y1} ${this.x} ${this.y}`
}

export class ContQuadCurveTo {
    constructor(
        readonly command: 'T' | 't', 
        readonly x: number, 
        readonly y: number) {}
    toString = () => `${this.command}${this.x} ${this.y}`
}

export enum Arc { Small = 0, Large = 1 }
export enum Sweep { CW = 0, CCW = 1 }

export class ArcTo {
    constructor(
        readonly command: 'A' | 'a', 
        readonly rx: number, 
        readonly ry: number,
        readonly rot: number,
        readonly arc: Arc,
        readonly sweep: Sweep,
        readonly x: number, 
        readonly y: number) {}
    toString = () => `${this.command}${this.rx} ${this.ry} ${this.rot} ${this.arc} ${this.sweep} ${this.x} ${this.y}`
}

export class ClosePath {
    readonly command: 'Z'
    toString = () => this.command
}

export type PathCommand = MoveTo | LineTo | HLineTo | VLineTo | CubicCurveTo | 
    ContCubicCurveTo | QuadCurveTo | ContQuadCurveTo | ArcTo | ClosePath 