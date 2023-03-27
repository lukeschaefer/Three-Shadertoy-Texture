void mainImage( out vec4 fragColor, in vec2 px )
{
    vec2 uv = (px - res) / res.y;
    //vec2 ms = (iMouse.xy - res) / res.y;
    vec4 col = cell(ch0, ivec2(px));
    vec3 av = vec3(0);

    vec2 hres = 0.5 * res;
    float a = hash(px.x, px.y) * 2. * pi; 
    float r = 0.;
    float count = 0.;
    
    // Hardcoded distance from origin to camera position
    // (sphere is at origin)
    float td = length(vec3(1, 1.8, -3)); 
    
    for (float i = 0.; i < 24.; i++) {
        // Blur with distance from mouse y position
        // (unused because it has artifacts at certain resolutions)
        // float sc = 10. * (1.-1./cosh(0.8*abs(uv.y-ms.y)));

        // Blur with abs(scene distance - target distance)
        float sc = 2. * (1.-1./cosh(0.1+0.2*abs(col.a-td)));
        
        // Increase angle and radius from px for noisy blur
        a += 1.;     
        r += sc;
        
        // New pixel and cell value
        vec2 cpx = px + r * Dir(a);
        vec3 c = cell(ch0, ivec2(cpx)).rgb;
        
        // Only sample on-screen cells
        float s = step(abs(cpx.y - hres.y), hres.y) *
                  step(abs(cpx.x - hres.x), hres.x);
        
        // idk
        s *= log(1.+r);
        
        count += s;
        av += s * c;
    }
    
    av /= count;

    fragColor = vec4(av, col.a);
  
}