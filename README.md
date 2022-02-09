# WebGL Template for Angular, TypeScript, WebPack

Copyright 2022 Steven Mycynek -- portions (c) 2012 kanda and matsuda

This project is nothing special, and it's not supposed to be.  There are a lot of WebGL project templates out there.

I just wanted a template that:

* Worked with more modern JavaScript and TypeScript (uses real classes
and `import` module syntax)
* Uses a modern framework (Angular 13)
* Could be deployed with Webpack.

The ones I saw so far claiming the above were pretty badly broken.  I also hated
writing `glsl` shaders as strings, especially strings concatenated with `\n` and `+`,
so thankfully, there are webpack loaders available.

I made the NIN, rook, and box models in https://cad.onshape.com

Finally, I took some of the WebGL library code for math and loading shaders, buffers, and obj files
from  *WebGL Programming Guide*  and did a rough port to TypeScript to make them a little nicer to work with in VS Code and Angular.
(See the `lib` directory for attribution.)


## Usage
`yarn install` and...

`.\prep` -- build and zip for deployment

`.\run` -- run locally

## TODO
1.  Phong shading and lighting
2.  Colors, textures, and error handling
3.  Ability to upload other file types besides .obj
4.  Anything else that will be useful as a starter template.


## Tips
Default lighting, scale, and position for custom uploaded models are just best guesses, and the parser
may occasionally fail on models you create or download -- I can't fully support the obj spec with a 3rd-party parser in my spare time :)

Try using directional lighting and changing the scale and translation if you can't see
your model.  See
* https://stevenvictor.net/glta/assets/models/teapot.obj
* https://stevenvictor.net/glta/assets/models/skull.obj
for a few tested sample models to upload, or create a simple one in Blender, Onshape, or other 3D tool.  Colors and textures are currently not supported.

## Live demo
https://stevenvictor.net/glta
