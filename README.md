# Three-Shadertoy-Texture

Small utility for easily using a [Shadertoy](https://www.shadertoy.com/) as a texture in a [Three.js](https://threejs.org/) project.

## About

Shadertoy is a neat website where users can create and share shaders. However, there's a few obstacles to
directly using these within ThreeJS. While ThreeJS supports shader-based materials via 
[ShaderMaterial](https://threejs.org/docs/?q=ShaderMa#api/en/materials/ShaderMaterial), for most shaders on
Shadertoy, you can't simply copy-and-paste the code there into your project and get something working. This
is because Shadertoy does a few nifty things to make it easier to make cool things:

  - Shadertoy expects you to define a function `mainImage`
  - Shadertoy provides a bunch of utility uniforms
  - Shadertoy adds "buffers" so have multi-pass rendering

The last one is probably the most important one, and allows for all sorts of really cool things. Anyway,
this tool wraps around the Shadertoy contents and makes it so you can use just about any of them in ThreeJS.

## How to use

First, install with `npm i three-shadertoy-texture`.

Then use it like so:

``` typescript
export const CoolTexture = new ShadertoyTexture(512, 512);

CoolTexture.common = `...copy-and-pasted code from the 'Common' section...`;

CoolTexture.bufferA.shader = `...code from 'BufferA' section...`;

// Load the input that iChannel0 in BufferA uses:
const loader = new THREE.TextureLoader();
CoolTexture.bufferA.iChannel[0] = loader.load("/Orb%20Tunneler/iChannel0.jpg");

// BufferB iChannel0 uses the output of BufferA
CoolTexture.bufferB.shader = bufferB;
CoolTexture.bufferB.iChannel[0] = CoolTexture.bufferA;

// Shader content from the "Image" tab:
CoolTexture.image.shader = image;
CoolTexture.image.iChannel[0] = CoolTexture.bufferB;

// Some mesh you have:
cube.material.map = CoolShader.texture;

// To update every frame:
cube.onBeforeRender = (renderer) => {
  CoolShader.render(renderer);
}
```

And you're good to go! If you're confused, take a look at the code
in the example directory.

## FYI

There's some Shadertoy features it currently doesn't support:

- Mouse stuff.
- Soundcloud stuff.
- Built-in-textures.
  If a Shadertoy uses one of the built-in textures for an iChannel, you
  have to download that texture yourself.
- Probably other stuff.

