import { GlUtil } from '../lib/glUtil';

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
  public clone(): Triple {
    return new Triple(this.x, this.y, this.z);
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
  public clone(): Ortho {
    return new Ortho(this.left, this.right, this.bottom, this.top, this.near, this.far);
  }
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
  public clone(): Perspective {
    return new Perspective(this.fieldOfView, this.aspectRatio, this.near, this.far);
  }
}

// Contains model data in array format ready for WebGL.
export class Model {
  constructor(gl: any, vertices: Float32Array, normals: Float32Array, indices: Uint16Array, scale: number) {
    this.vertices = vertices;
    this.normals = normals;
    this.indices = indices;
    this.scale = scale;
    this.gl = gl;
    this.init(gl);
  }
  private init(gl: any) {
    const indexBuffer = gl.createBuffer();
    if (!indexBuffer) {
      console.log('No index buffer');
      throw new Error('No index buffer');
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
    this.indexBuffer = indexBuffer;
    const positionBuffer = GlUtil.initArrayBuffer(gl, 'a_Position', this.vertices, 3, gl.FLOAT);
    if (!positionBuffer)
      throw new Error('cannot init a_Position');
    this.positionBuffer = positionBuffer;
    const normalBuffer = GlUtil.initArrayBuffer(gl, 'a_Normal', this.normals, 3, gl.FLOAT);
    if (!normalBuffer)
      throw new Error('cannot init a_Normal');
    this.normalBuffer = normalBuffer;
  }
  public activate() {
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    let a_attribute = this.gl.getAttribLocation(this.gl.program, 'a_Position');
    this.gl.vertexAttribPointer(a_attribute, 3, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(a_attribute);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer);
    a_attribute = this.gl.getAttribLocation(this.gl.program, 'a_Normal');
    this.gl.vertexAttribPointer(a_attribute, 3, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(a_attribute);
  }
  private gl: any;
  public indexBuffer: any;
  public positionBuffer: any;
  public normalBuffer: any;
  public vertices: Float32Array;
  public normals: Float32Array;
  public indices: Uint16Array;
  public scale: number;
}
