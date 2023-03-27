import { ExampleShader } from "..";
import { ShadertoyTexture } from "../../../src/ShadertoyTexture";
import image from './image.frag';

// This is a relatively simple ShaderToy that only requires an "image" shader.
// No channels or buffers or common code.
// source: https://www.shadertoy.com/view/cdV3DW

const EelTexture = new ShadertoyTexture(512, 512);
EelTexture.image.shader = image;

export const EelExample : ExampleShader = {
  texture: EelTexture,
  title: "Electric Eel Universe",
  link: "https://www.shadertoy.com/view/cdV3DW",
  author: "mrange",
  button: "eels"
}