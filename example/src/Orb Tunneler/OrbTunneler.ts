import * as THREE from 'three';

import { ShadertoyTexture } from "../../../src/ShadertoyTexture";
import common from './common.frag';
import image from './image.frag';
import bufferA from './bufferA.frag';
import bufferB from './bufferB.frag';
import { ExampleShader } from '..';

// This is a more complex ShaderToy that involves buffers and common shared code:
// Credit here: https://www.shadertoy.com/view/mdtSR7

export const OrbTunneler = new ShadertoyTexture(512, 512);
OrbTunneler.common = common;

OrbTunneler.bufferA.shader = bufferA;
const loader = new THREE.TextureLoader();

OrbTunneler.bufferA.iChannel[0] = loader.load("/Orb%20Tunneler/iChannel0.jpg");

OrbTunneler.bufferB.shader = bufferB;
OrbTunneler.bufferB.iChannel[0] = OrbTunneler.bufferA;

OrbTunneler.image.shader = image;
OrbTunneler.image.iChannel[0] = OrbTunneler.bufferB;


export const OrbExample : ExampleShader = {
  texture: OrbTunneler,
  title: "Orb Tunneler",
  link: "https://www.shadertoy.com/view/mdtSR7",
  author: "SnoopethDuckDuck",
  button: "orb"
}