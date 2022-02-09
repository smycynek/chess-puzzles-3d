attribute vec4 a_TriangleColor;
attribute vec4 a_Normal;   // Normal is hard coded
uniform vec3 u_LightColor;
uniform vec3 u_LightDirection;
uniform vec3 u_LightPosition;
uniform bool u_UseDirectionalLight;
uniform bool u_FancyPoints;
attribute vec4 a_Position;
uniform mat4 u_ViewMatrix;
uniform mat4 u_ProjMatrix;
uniform mat4 u_ModelMatrix;
uniform mat4 u_NormalMatrix;
attribute float a_PointSize;   // Only used in point rendering
varying vec4 v_Color;  // Fragment color
void main() {

    // Rotate the normals along with the model (using the special normal matrix), as they are provided in advance and not
    // calculated after the final translation.
  vec4 a_NormalR = u_NormalMatrix * a_Normal;
  vec3 normal = normalize(a_NormalR.xyz);

    // Dot product of the light direction and the orientation of a surface (the normal)
  vec3 light_direction;
  if(u_UseDirectionalLight == true) {
    light_direction = u_LightDirection;
  } else { // Note -- with the point light model, the normal is the same for both triangles of each face,
        // but the vertex position varies,
        // so you get some nice pseudo pixel-level shading, but not quite Phong-level
    vec4 vertex_position =  u_ModelMatrix * a_Position;
    vec3 point_light_direction = normalize(u_LightPosition - vec3(vertex_position));
    light_direction = point_light_direction;
  }
  float brightnessScalar = max(dot(light_direction, normal), 0.0);
     // Calculate how much to scale the color down by (Lambert Cosine Rule)
  vec3 finalColor = u_LightColor * a_TriangleColor.rgb * brightnessScalar;
  v_Color = vec4(finalColor, a_TriangleColor.a);
  gl_Position = u_ProjMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;  // Set the vertex coordinates of the point

  if (u_FancyPoints == true) {
    gl_PointSize = a_PointSize;
  }
  else {
    gl_PointSize = a_PointSize/3.0;
  }
}
