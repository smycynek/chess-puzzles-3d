# ChessGL
Copyright 2022 Steven Mycynek


## Update
New site using threeJS at https://stevenvictor.net/chess3d

## Basics
This is the first project I made based off of my WebGL starter template:
https://github.com/smycynek/webgl-template

It takes data from chess puzzles generated from
https://stevenvictor.net/chess and renders them in WebGL
using `.obj` models created in https://cad.onshape.com

There's plenty more to improve and clean up, but things are at
a good-enough state to post the source.

## Usage
`yarn install` and...

`.\prep` -- build and zip for deployment

`.\run` -- run locally

## TODO
* Zoom, pan, scroll
* Add rank and file labels
* Edit/drag/drop pieces in 3d (The view is read-only currently)
* Better management of buffers and drawing order for higher performance


## Live demo
https://stevenvictor.net/chessGL

## Credits
* Obj parsing code (c) 2012 kanda and matsuda
* Wood texture by Augustine Wong: https://unsplash.com/@augustinewong