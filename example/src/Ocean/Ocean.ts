import { ExampleShader } from "..";
import { ShadertoyTexture } from "../../../src/ShadertoyTexture";
import image from './image.frag';

// This is a relatively simple ShaderToy that only requires an "image" shader.
// No channels or buffers or common code.
// source: https://www.shadertoy.com/view/cdV3DW

export const OceanTexture = new ShadertoyTexture(512, 512);
OceanTexture.image.shader = image;

export const OceanExample : ExampleShader = {
  texture: OceanTexture,
  title: "Very fast procedural ocean",
  link: "https://www.shadertoy.com/view/MdXyzX",
  author: "afl_ext",
  button: "ocean"
}