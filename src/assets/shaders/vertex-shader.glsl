
attribute vec4 a_Normal;   // Normal is hard coded
attribute vec4 a_Position;
uniform mat4 u_ViewMatrix;
uniform mat4 u_ProjMatrix;
uniform mat4 u_ModelMatrix;
uniform mat4 u_NormalMatrix;
varying vec3 v_interpolatedNormal;
varying vec3 v_interpolatedVertexPosition;

void main() {
    // Rotate the normals along with the model (using the special normal matrix), as they are provided in advance and not
    // calculated after the final translation.
    vec4 a_NormalR = u_NormalMatrix * a_Normal;
    vec3 normal = normalize(a_NormalR.xyz);
    vec4 vertex_position = u_ModelMatrix * a_Position;
    v_interpolatedVertexPosition = vec3(vertex_position) / vertex_position.w;
    v_interpolatedNormal = normal;
    gl_Position = u_ProjMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;  // Set the vertex coordinates of the point
}
