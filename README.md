# Three-Shadertoy-Texture

Small utility for easily using a [Shadertoy](https://www.shadertoy.com/) as a texture in a [Three.js](https://threejs.org/) project.

```sh
npm i three-shadertoy-texture
```

Here's a quick [example](https://three-shadertoy-texture-example.vercel.app/).

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
import { ShadertoyTexture } from "three-shadertoy-texture";

export const CoolTexture = new ShadertoyTexture(512, 512);
CoolTexture.image.shader = `...copy-and-pasted code from the 'Image' section...`;

// Some mesh you have:
cube.material.map = CoolShader.texture;

// To update every frame:
cube.onBeforeRender = (renderer) => {
  CoolShader.render(renderer);
}
```

And you're good to go! If you're confused, take a look at the code
in the [example directory](https://github.com/lukeschaefer/Three-Shadertoy-Texture/tree/main/example/src).

### Advanced

As mentioned earlier, Shadertoy supports Buffers, allowing creators to make really cool stuff.
This tool supports buffers using the same copy-paste techniques, except you just have to
pay attention to the inputs for each Buffer - which may be other Buffers, or some Texture.
Here's how that looks:

```typescript
// Load the input that iChannel0 in BufferA uses:
CoolTexture.bufferA.shader  = `Code from the BufferA section...`

// BufferA's iChannel0 is some sort of image:
const loader = new THREE.TextureLoader();
CoolTexture.bufferA.iChannel[0] = loader.load("iChannel0.jpg");

// BufferB iChannel0 uses the output of BufferA
CoolTexture.bufferB.shader = `BufferB Content Here`;
CoolTexture.bufferB.iChannel[0] = CoolTexture.bufferA;

// And the 'Image' tab uses BufferB as it's input:
CoolTexture.image.shader = image;
CoolTexture.image.iChannel[0] = CoolTexture.bufferB;
```

You can also add your own uniforms like so:

```typescript
// Global uniform:
CoolTexture.uniforms.uFluidSpeed = {value: 2.5};

// Per-buffer uniform:
CoolTexture.image.uniforms.uBirdColor = {value: new THREE.Color('blue')};
```

## FYI

There's some Shadertoy features it currently doesn't support:

- Mouse stuff. (mouse is always set to screen center)
- Soundcloud stuff.
- Built-in-textures.
  If a Shadertoy uses one of the built-in textures for an iChannel, you
  have to download that texture yourself.
- Probably other stuff.
- I'm using this in my WIP [LunarLander](https://lander.luke.software) project for the smoke.

