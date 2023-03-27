// Thanks to (everyone I've copied code + ideas from):
// TheArtOfCode - raymarching
//  BlackleMori - hash, erot
//      Sizertz - AO, shadow
//        NuSan - materials
//        Tater - raymarching
//         Leon - raymarching hash trick
//           iq - pal, smin, most things!

#define tau 6.2831853071
#define pi 3.1415926535
#define t iTime
#define res iResolution.xy
#define k 1./iResolution.y
#define thc(a,b) tanh(a*cos(b))/tanh(a)
#define ths(a,b) tanh(a*sin(b))/tanh(a)
#define pal(a,b) .5+.5*cos(2.*pi*(a+b))
#define sabs(x) sqrt(x*x+1e-2)
//#define sabs(x, k) sqrt(x*x+k)
#define Dir(a) vec2(cos(a),sin(a))
#define rot(a) mat2(cos(a), -sin(a), sin(a), cos(a))

#define ch0 iChannel0
#define ch1 iChannel1
#define ch2 iChannel2

vec4 cell(in sampler2D ch, in ivec2 p) {
    ivec2 r = ivec2(textureSize(ch, 0));
    p = (p+r) % r;
    return texelFetch(ch, p, 0);
}

#define FK(k) floatBitsToInt(k*k/7.)^floatBitsToInt(k)
float hash(float a, float b) {
    int x = FK(a), y = FK(b);
    return float((x*x+y)*(y*y-x)-x)/2.14e9;
}

vec3 erot(vec3 p, vec3 ax, float ro) {
  return mix(dot(ax, p)*ax, p, cos(ro)) + cross(ax,p)*sin(ro);
}

float cc(float a, float b) {
    float f = thc(a, b);
    return sign(f) * pow(abs(f), 0.25);
}

float cs(float a, float b) {
    float f = ths(a, b);
    return sign(f) * pow(abs(f), 0.25);
}

float h21(vec2 a) { return fract(sin(dot(a.xy, vec2(12.9898, 78.233))) * 43758.5453123); }
float mlength(vec2 uv) { return max(abs(uv.x), abs(uv.y)); }
float mlength(vec3 uv) { return max(max(abs(uv.x), abs(uv.y)), abs(uv.z)); }

float smin(float a, float b, float str) {
    float h = clamp(0.5 + 0.5 * (b - a) / str, 0., 1.);
    return mix(b, a, h) - str * h * (1. - h);
}

float seg(vec3 p, vec3 a, vec3 b, float r) {
  vec3 pa = p - a, ba = b - a;
  float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
  return length( pa - ba*h ) - r;
}