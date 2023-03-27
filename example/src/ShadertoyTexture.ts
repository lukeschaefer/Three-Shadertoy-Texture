// YES I DUPLICATED THIS FILE INTO THE EXAMPLES FOLDER
// IGNORE IT PLEASE, ILL FIX IT LATER, JUST TRYING TO
// GET THIS OUT THERE FOR NOW. THANKS.

import * as THREE from 'three';

type UniformMap = {
  [uniform: string]: THREE.IUniform<any>;
};

const BASE_FRAG = `
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform int iFrame;
uniform vec4 iMouse;

varying vec2 vUv;
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
uniform sampler2D iChannel2;

void mainImage( out vec4,  vec2 fragCoord );
void main () {
    vec4 outfrag;
    mainImage(outfrag,iResolution*vUv);
    gl_FragColor = outfrag;
}
`;

const VERTEX_SHADER = `
    varying vec2 vUv;
    
    void main() {
        vUv = uv;
        gl_Position = vec4(position,1.0);
    }
`;



export class ShadertoyTexture {
  
  texture: THREE.Texture;
  image: BufferShader;

  bufferA: BufferShader;
  bufferB: BufferShader;
  bufferC: BufferShader;
  bufferD: BufferShader;

  uniforms : UniformMap = {
    iMouse: {value: new THREE.Vector4(0.5, 0.5, 0, 0)},
    iFrame: {value: 0},
    iTime: {value: 0},
    iResolution: {value: new THREE.Vector2(512, 512)},
  };

  clock = new THREE.Clock();

  set common(value: string) {
    this.bufferA.common = value;
    this.bufferB.common = value;
    this.bufferC.common = value;
    this.bufferD.common = value;
    this.image.common = value;
  }

  constructor(public width: number, public height: number) {
    this.bufferA = new BufferShader(this.width, this.height);
    this.bufferB = new BufferShader(this.width, this.height);
    this.bufferC = new BufferShader(this.width, this.height);
    this.bufferD = new BufferShader(this.width, this.height);

    this.image = new BufferShader(this.width, this.height);
    this.texture = this.image.outputBuffer.texture;
  }

  render(renderer : THREE.WebGLRenderer) {
    this.uniforms.iTime.value = this.clock.getElapsedTime();
    this.uniforms.iFrame.value++;

    const renderOrder = [this.bufferA, this.bufferB, this.bufferC, this.bufferD, this.image];
    renderOrder.forEach((buffer) => {
      if (buffer.enabled) {
        // Update buffer uniforms with global uniforms:
        Object.keys(this.uniforms).forEach((key) => {
          buffer.uniforms[key] = this.uniforms[key];
        });
        buffer.render(renderer);
      }
    });
    this.image.outputBuffer.texture.needsUpdate = true;
  }
}

interface IChannelConfig {
  getTexture() : THREE.Texture
}

function isTexture(input : THREE.Texture | BufferShader) : input is THREE.Texture {
  return input['isTexture'];
}
const emptyTexture = new THREE.Texture();

export class BufferShader {
  common = '';
  outputBuffer: THREE.WebGLRenderTarget;
  readBuffer: THREE.WebGLRenderTarget;

  // TODO: Support non-texture channels, and do something more effecient here?
  public iChannel : (THREE.Texture | BufferShader)[] = [emptyTexture, emptyTexture, emptyTexture, emptyTexture];

  private iChannel0Config : IChannelConfig | undefined;
  private iChannel1Config : IChannelConfig | undefined;
  private iChannel2Config : IChannelConfig | undefined;

  uniforms = {
    iChannel0: {value: emptyTexture},
    iChannel1: {value: emptyTexture},
    iChannel2: {value: emptyTexture},
    iChannel3: {value: emptyTexture}
  };

  camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);

  scene: THREE.Scene;

  enabled = false;
  plane: THREE.Mesh<THREE.PlaneGeometry, THREE.Material | THREE.Material[]>;

  set shader(value: string) {
    this.enabled = true;
    const fragmentShader = BASE_FRAG + "\n" + this.common + "\n" + value;

    const material = new THREE.ShaderMaterial({
      fragmentShader,
      vertexShader: VERTEX_SHADER,
      uniforms: this.uniforms
    });

    this.plane.material = material;
  }

  constructor(public width: number, public height: number) {

    this.outputBuffer = new THREE.WebGLRenderTarget(width, height, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      encoding: THREE.LinearEncoding,
      type: THREE.FloatType,
      stencilBuffer: false,
    });

    this.readBuffer = this.outputBuffer.clone();

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);

    this.plane = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({color: 0xff0000}));
    this.scene.add(this.plane);
  }

  swap() {
    const temp = this.readBuffer;
    this.readBuffer = this.outputBuffer;
    this.outputBuffer = temp;
  }

  private getIChannel(index: number) {
    const iChannel = this.iChannel[index];
    if(isTexture(iChannel)) return iChannel;
    return iChannel.readBuffer.texture;
  }

  render(renderer: THREE.WebGLRenderer) {
    // Update iChannels:
    this.uniforms.iChannel0.value = this.getIChannel(0);
    this.uniforms.iChannel1.value = this.getIChannel(0);
    this.uniforms.iChannel2.value = this.getIChannel(0);
    this.uniforms.iChannel3.value = this.getIChannel(0);

    renderer.setRenderTarget(this.outputBuffer);
    renderer.clear();
    renderer.render(this.scene, this.camera);
    renderer.setRenderTarget(null);
    this.swap();
  }
}