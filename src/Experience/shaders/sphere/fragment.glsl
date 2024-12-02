varying vec3 vColor;
varying vec3 vNormal;
varying vec3 vViewDirection;

void main()
{
    float fresnel = pow(1.0 - abs(dot(normalize(vNormal), normalize(vViewDirection))), 2.0);
    gl_FragColor = vec4(vColor, fresnel);
}
