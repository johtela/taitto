import * as tt from '..'
// import * as lits from 'literatets/lib/visualizer'
import * as scene from './scene'
import "./test.css"

let arrow: tt.Arrow = { 
    closed: true,
    className: "arrow",
    positions: [ tt.ArrowPos.Destination ],
    width: 10,
    length: 10
}

let nodes = tt.nodes("First one", "Second case", "Third degree")
let [ abba, umma, mumma ] = nodes 
let edges = tt.edges([[abba, umma, "test1"], [abba, mumma, "test2"]], arrow)

// lits.registerVisualizer("digraph", (input: string, parent: HTMLElement) =>
//     tt.digraph({ nodes, edges, direction: 'TB' }, parent))

// lits.registerVisualizer("filediagram", (input: string, parent: HTMLElement) =>
//     playAnimations(new scene.Scene(parent)))

async function playAnimations(sc: scene.Scene) {
    while (true) {
        sc.setup()
        await sc.openBaseFolder.play()
        await sc.addLitsConfig.play()
        await sc.openTerminal.play()
        await sc.processFiles.play()
        sc.teardown()
    }
}