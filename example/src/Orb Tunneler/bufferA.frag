#define MAX_STEPS 400
#define MAX_DIST 50.
#define SURF_DIST .001

#define rn 64.0
float getFreq(float x) {
	return texture(ch2, vec2(floor(x * rn + 1.) / rn, 0)).x;
}

vec3 ori() {
    vec2 m = iMouse.xy/iResolution.xy;
    vec3 ro = vec3(1, 1.8, -3);
    ro.xz *= rot(-0.2 * t);
    // ro.yz *= rot(-m.y*3.14+1.);
    // ro.xz *= rot(-m.x*6.2831);
    return ro;
}

vec2 map(vec3 p) {   
    // Increase y with distance from origin
    p.y += 0.4 - 0.01 * dot(p.xz, p.xz);

    // Elevate texture from plane
    float tx = texture(ch1, 0.015*(p.xz + 0.5 * t)).r;
    tx += 0.4 * texture(ch1, 0.1 * (p.xz + 0.5 * t)).r;
    
    // Plane distance
    float d = p.y - tx;
    
    // Sphere radius
    float r = 0.55;
    
    // Cutout line from plane
    float dSeg = seg(p, vec3(0,0.5*r,0), vec3(-100, 0.5*r, -100), r);
    d = -smin(-d, dSeg, r);
    
    // Sphere at origin
    vec3 q = vec3(0, 0.5 * r, 0);   
    float dSphere = length(p - q) - r;
    
    // Audio
    float f = getFreq(0.25);
    float f0 = getFreq(0.);
    
    // Orbiting sphere, mix between 2 positions with audio
    float mx = .5+.5*cos(8.*pi*f0);
    //p.xz = mix(p.xz * rot(-t), p.xz * rot(t), mx);
    vec3 q2 = vec3(1.5 * f, 2.5 * r - f * r, 1.5 * f);
    float r2 = 1.4*r*f*f0*f0;
    q2.xz *= rot(t);
    float dSphere2 = length(p - q2) - tanh(0.1 * t) * r2;
    
    // Maybe sloppy way of return mat etc
    //dSphere2 = smin(dSphere, dSphere2, length(q-q2));
    if (dSphere2 < min(dSphere, d))
        return vec2(dSphere2, 0.5);
    
    // dSphere = min(dSphere, dSphere2);
    if (dSphere < d)
        return vec2(dSphere, 1.);

    return vec2(d, 0.);
}

vec3 march(vec3 ro, vec3 rd, float z) {	
    float d = 0.;
    float s = sign(z);
    int steps = 0;
    float mat = 0.;
    for(int i = 0; i < MAX_STEPS; i++) {
    	vec3 p = ro + rd * d;
        vec2 m = map(p);
        //m.x *= 0.8 + 0.2 * hash(hash(p.x,p.z), p.y); // for glow
        if (s != sign(m.x)) { z *= 0.5; s = sign(m.x); }
        if (abs(m.x) < SURF_DIST || d > MAX_DIST) {
            steps = i + 1;
            mat = m.y;
            break;
        }
        d += m.x * z; 
    }   
    return vec3(min(d, MAX_DIST), steps, mat);
}

vec3 norm(vec3 p) {
	float d = map(p).x;
    vec2 e = vec2(.001, 0);
    
    vec3 n = d - vec3(
        map(p-e.xyy).x,
        map(p-e.yxy).x,
        map(p-e.yyx).x);
    
    return normalize(n);
}

vec3 dir(vec2 uv, vec3 p, vec3 l, float z) {
    vec3 f = normalize(l-p),
        r = normalize(cross(vec3(0,1,0), f)),
        u = cross(f,r),
        c = f*z,
        i = c + uv.x*r + uv.y*u,
        d = normalize(i);
    return d;
}


void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = (fragCoord-.5*iResolution.xy)/iResolution.y;
	
    vec3 ro = ori();
    
    vec3 rd = dir(uv, ro, vec3(0), 1.);
    vec3 col = vec3(0);
   
    // March 1
    vec3 m = march(ro, rd, 1.);  
    float d = m.x;    
    vec3 p = ro + rd * d;
    vec3 n = norm(p);
    vec3 r = reflect(rd, n); 
    
    // March 2 (reflect)
    vec3 p2 = p + 200. * SURF_DIST * n;
    vec3 m2 = march(p2, r, 1.);
    vec3 n2 = norm(p2);
    vec3 r2 = reflect(r, n2);
    
    // March 3 (reflect)
    vec3 p3 = p2 + 200. * SURF_DIST * n2;
    vec3 m3 = march(p3, r2, 1.);
    vec3 n3 = norm(p3);
    vec3 r3 = reflect(r2, n3);

    float f0 = getFreq(0.);

    col = vec3((m2.y + m3.y)/(2.*MAX_DIST));

    // Lighten origin sphere
    if (m.z == 1. && m2.z == 0.)
        col *= 1.8;
        
    // Lighten orbit sphere with audio
    else if (m.z == 0.5)
        col *= 3. * f0;

    // Draw nyan cat on plane :)
    else if (m.z == 0.) {
        vec2 tuv = 0.1 * (1.5 * (p.xz + 0.5*t));
        tuv *= rot(-pi/2.+pi/4.);
        tuv *= 0.2 * vec2(1,8);         
        vec3 tx = texture(ch0, tuv).rgb;
        col =  mix(col, tx, 0.4);
    }

    // Lighten with distance from origin
    col = mix(col, vec3(1.3), 1.-1./cosh(0.15*length(p.xz)));
    
    // Darken with distance travelled in march 3
    vec3 gl = vec3(1. - 1./cosh(-0.045 * m3.y));
    col *= gl;
    
    // Change color with audio (with distance from origin)
    vec3 cl = .5 + .5 * cos(2.*pi*(3.*f0 + vec3(0,1,2)/3.));
    cl *= tanh(0.05 * t);
    vec3 cl2 = f0 * f0 * cl * (exp(-2.*length(p2)) + exp(-2.*length(p)));
    //col = mix(col*20.*cl2, col+cl2, .6+.4*ths(4., 4.*(p.y)-0.5*t));
    
    // Gamma correction
    col = pow(col, vec3(1./2.6)); 
    
    col += cl2;
      
    fragColor = vec4(col, d);
}