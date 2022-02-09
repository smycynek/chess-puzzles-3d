
// Basic 3-component container
export class Triple {
  public x: number;
  public y: number;
  public z: number;

  constructor(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
}


// Make a triple with the same number in each field
export function tripleUniform(uniform: number): Triple {
  return new Triple(uniform, uniform, uniform);
}

// Basic ortho parameter container
export class Ortho {
  constructor(left: number, right: number, bottom: number, top: number, near: number, far: number) {
    this.left = left;
    this.right = right;
    this.bottom = bottom;
    this.top = top;
    this.near = near;
    this.far = far;
  }
  public left: number;
  public right: number;
  public bottom: number;
  public top: number;
  public near: number;
  public far: number;
}

// Basic perspective parameter container
export class Perspective {
  constructor(fieldOfView: number, aspectRatio: number, near: number, far: number) {
    this.fieldOfView = fieldOfView;
    this.aspectRatio = aspectRatio;
    this.near = near;
    this.far = far;
  }
  public fieldOfView: number;
  public aspectRatio: number;
  public near: number;
  public far: number;
}

// Contains model data in array format ready for WebGL.
export class Model {
  constructor(vertices: Float32Array, normals: Float32Array, indices: Uint16Array, scale: number) {
    this.vertices = vertices;
    this.normals = normals;
    this.indices = indices;
    this.scale = scale;
  }
  public vertices: Float32Array;
  public normals: Float32Array;
  public indices: Uint16Array;
  public scale: number;
}
