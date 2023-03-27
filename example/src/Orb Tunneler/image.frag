float box( in vec2 p, in vec2 b ) {
    vec2 d = abs(p)-b;
    return length(max(d,0.0)) + min(max(d.x,d.y),0.0);
}

void mainImage( out vec4 fragColor, in vec2 px )
{
    vec2 uv = (px - 0.5 * res) / res.y;
    uv = abs(uv);

    // Chromatic aberration
    vec4 l = cell(ch0, ivec2(px - vec2(2,0)));
    vec4 r = cell(ch0, ivec2(px + vec2(2,0)));
    vec4 c = cell(ch0, ivec2(px));
    vec4 col = max(vec4(1,0,0,1)*l, vec4(0,0,1,1)*r);
    col = max(vec4(0,1,0,1)*c, col);
    
    // Resolution ratio and top-right corner position
    float rat = res.x / res.y;
    vec2 tr = 0.5 * vec2(rat, 1);
    
    // Distances for decoration
    float dMain = abs( box(uv, tr - 0.01 * rat) );
    float dBox  = abs( mlength(uv - tr + 0.025 * rat) - 0.01 );
    float dCir1 = length(uv - tr + vec2(.025,.042) * rat);
    float dCir2 = length(uv - tr + vec2(.042,.025) * rat);
    float dCir  = abs( min(dCir1, dCir2) - 0.008 );    
    float d = min(dMain, min(dBox, dCir));
    
    // Smoothstep and mix
    float s = 0.9 * smoothstep(-k, k, k - d);   
    col.rgb = mix(col.rgb, vec3(0.95), s);
    
    fragColor = col;
}