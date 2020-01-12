import * as el from '../svg/elem'

export abstract class Anim {
    public start: number = 0

    constructor(
        public target: el.Elem<SVGElement>,
        public duration: number = 1000) { }

    get stop(): number {
        return this.start + this.duration
    }

    play(): Promise<Anim> {
        return new Promise(resolve =>
            this.start != 0 ?
                setTimeout(() => this.run(resolve), this.start) :
                this.run(resolve))
    }

    protected abstract run(resolve: (anim: this) => void): void
}

export class AnimSequence {
    private anims: Anim[] = []

    play() {
        return Promise.all(this.anims.map(a => a.play()))
    }

    private add(anim: Anim, start: number) {
        anim.start = start
        let i = this.anims.findIndex(a => a.start > start)
        if (i < 0)
            this.anims.push(anim)
        else
            this.anims.splice(i, 0, anim)
    }

    addAt(anim: Anim | Anim[], start: number) {
        if (Array.isArray(anim))
            anim.forEach(a => this.add(a, start))
        else
            this.add(anim, start)
        return this
    }

    addAfter(anim: Anim | Anim[], after: Anim | number,
        delay: number = 0) {
        if (typeof after === "number")
            after = this.anims[after]
        this.addAt(anim, after.stop + delay)
        return this
    }

    addToEnd(anim: Anim | Anim[], delay: number = 0) {
        let maxstop = this.anims.length == 0 ? 0 :
            Math.max(...this.anims.map(a => a.stop))
        this.addAt(anim, maxstop + delay)
        return this
    }

    addToEndStaggered(anims: Anim[], gap: number, delay: number = 0) {
        let maxstop = this.anims.length == 0 ? 0 :
            Math.max(...this.anims.map(a => a.stop))
        for (let i = 0; i < anims.length; ++i)
            this.addAt(anims[i], maxstop + delay + (i * gap))
        return this
    }
}
