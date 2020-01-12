![](docs/images/taitto3.svg)
# Ragbag of SVG Utilities

TAITTO is a TS/JS library that contains discrete SVG related functionality. It 
is currently somewhat odd combination, and maybe in future splitted to multiple
packages.

Currently the library consist of four parts:

- Core part that wraps SVG DOM elements and provides helper functions for
  manipulating them. This code lives under the `src/svg` folder.

- Animation library that builds on the core and provides features used to
  create SVG animations. Code for this is in the `src/anim` folder.

- Functions that create directional graph diagrams. This code uses [dagre][] to
  layout the diagrams. The code is in the `src/digraph.ts` module.

- Functions that create SVG file and folder icons. These can be used to create
  animations and illustrations. You can find the code in `src/file-diagram.ts`

Documentation for the library will be published once its structure is 
locked down.