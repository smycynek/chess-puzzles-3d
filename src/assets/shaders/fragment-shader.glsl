precision mediump float;
varying vec3 v_interpolatedNormal;
varying vec3 v_interpolatedVertexPosition;
uniform vec3 u_LightPosition;  // Point light model
uniform vec4 u_AmbientColor;  // Whatever the color of the material is
uniform vec4 u_DiffuseColor;  // Whatever the color of the matieral is
uniform vec4 u_SpecularColor; // Typically just white
void main() {
    float ambientCoefficient = 0.2; // A small boost to reduce 100% black areas
    float diffuseCoefficient = 1.0; // Most of our shading comes from diffuse
    float specularCoefficient = 0.5;  // Modest but not too bright on highlights

    float shininessCoefficient = 5.0;  // Nice semi-gloss moderate shine

    vec3 interpolatedNormalNormalized = normalize(v_interpolatedNormal);
    vec3 normalizedLightToPosition = normalize(u_LightPosition - v_interpolatedVertexPosition);

    // The smaller the angle between the normal and the light, the larger the dot or cosine, and the larger
    // the diffuse brightness value.  Use zero if negative.
    float lambertShadeFraction = max(dot(interpolatedNormalNormalized, normalizedLightToPosition), 0.0);
    float specularHighlightFraction = 0.0;
    if(lambertShadeFraction > 0.0) {
        vec3 lightReflectAngle = reflect(-normalizedLightToPosition, interpolatedNormalNormalized);
        // Reflect the light vector over the normal vector to get the, as you'd guess "reflected light vector"
        vec3 negNormalizedInterpolatedVertexPosition = normalize(-v_interpolatedVertexPosition);
    // Compute the specular term
        float specularAngleCosine = max(dot(lightReflectAngle, negNormalizedInterpolatedVertexPosition), 0.0);
        // Fragment position and eye vector are the same here, since the
        // model is adjusted to account for eye position.
        // The smaller the angle between the position and the light, the larger the dot or cosine, so the larger
        // the final specular value will be.  If the dot is negative, just use zero.
        specularHighlightFraction = pow(specularAngleCosine, shininessCoefficient);  //The higher the power, the quicker the highlight disappears
    }
    // Combine ambient, diffuse, and specular color values with their weights from above to get the final
    // composite phong shaded fragment color.
    gl_FragColor = (
        ambientCoefficient  * u_AmbientColor +
        diffuseCoefficient  * lambertShadeFraction * u_DiffuseColor +
        specularCoefficient * specularHighlightFraction * u_SpecularColor);
    gl_FragColor[3] = 1.0; // Always be 100% opaque.

}
