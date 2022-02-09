import { AppComponent } from './app.component';
import { Constants, PointStyle } from './constants';
import { GlUtil } from './lib/glUtil';
import { Matrix4 } from './lib/math';

// Used by the main Angular AppComponent for lower-level functionality
export class Implementation {
  constructor(public app: AppComponent) {
  }
  public getContext(): any | null {
    let gl;

    const canvas = this.getCanvas();

    if (!canvas) {
      console.log('Failed to get canvas');
      return null;
    }
    if (canvas instanceof HTMLCanvasElement) {
      // Get the rendering context for WebGL
      gl = canvas.getContext('webgl');
      if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return null;
      }
    }
    else {
      console.log('Canvas is wrong type');
      return null;
    }
    return gl;
  }

  private setupProjection(): Matrix4 {
    const projMatrix = new Matrix4();
    if (this.app.projectionType == Constants.ORTHO) {
      projMatrix.setOrtho(
        this.app.ortho.left,
        this.app.ortho.right,
        this.app.ortho.bottom,
        this.app.ortho.top,
        this.app.ortho.near,
        this.app.ortho.far,
      );
    }
    else {
      projMatrix.setPerspective(
        this.app.perspective.fieldOfView,
        this.app.perspective.aspectRatio,
        this.app.perspective.near,
        this.app.perspective.far,
      );
    }
    return projMatrix;
  }

  private setupView() {
    const viewMatrix: Matrix4 = new Matrix4();
    viewMatrix.setLookAt(
      this.app.eye.x,
      this.app.eye.y,
      this.app.eye.z,
      this.app.look.x,
      this.app.look.y,
      this.app.look.z,
      this.app.up.x,
      this.app.up.y,
      this.app.up.z
    );
    return viewMatrix;

  }

  private setupRotation(): Matrix4 {
    let rotationMatrix = new Matrix4();
    rotationMatrix = rotationMatrix.rotate(this.app.rotation.x, 1, 0, 0);
    rotationMatrix = rotationMatrix.rotate(this.app.rotation.y, 0, 1, 0);
    rotationMatrix = rotationMatrix.rotate(this.app.rotation.z, 0, 0, 1);
    return rotationMatrix;
  }

  private setupTranslation(): Matrix4 {
    const translationMatrix = new Matrix4();
    translationMatrix.setTranslate(
      this.app.translate.x, this.app.translate.y, this.app.translate.z
    );
    return translationMatrix;
  }

  private setupScale(): Matrix4 {
    const scaleMatrix = new Matrix4();
    scaleMatrix.setScale(
      this.app.scale.x,
      this.app.scale.y,
      this.app.scale.z
    );
    return scaleMatrix;
  }

  private errorCheck(location: number, attribute_name: string): void {
    const err = this.app.gl.getError();
    if (err !== 0) {
      console.log(`get location ${attribute_name} error: ${err}`);
      throw new Error('get location');
    }

    if (location < 0) {
      console.log('Failed to get the storage location of ' + location);
      throw new Error('Storage location');
    }
  }

  private getAttribLocation(attribute_name: string): number {
    const location = this.app.gl.getAttribLocation(this.app.gl.program, attribute_name);
    this.errorCheck(location, attribute_name);
    return location;
  }

  private getUniformLocation(attribute_name: string): number {
    const location = this.app.gl.getUniformLocation(this.app.gl.program, attribute_name);
    this.errorCheck(location, attribute_name);
    return location;
  }

  private setupIndexBuffer(model: any): number {
    const indexBuffer = this.app.gl.createBuffer();
    if (!indexBuffer) {
      console.log('No index buffer');
      throw new Error('No index buffer');
    }
    this.app.gl.bindBuffer(this.app.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    this.app.gl.bufferData(this.app.gl.ELEMENT_ARRAY_BUFFER, model.indices, this.app.gl.STATIC_DRAW);
    return model.indices.length;
  }

  private setupGeometryBuffer(model: any): void {
    if (!GlUtil.initArrayBuffer(this.app.gl, 'a_Position', model.vertices, 3, this.app.gl.FLOAT)) throw new Error('cannot init a_Position');
    if (!GlUtil.initArrayBuffer(this.app.gl, 'a_Normal', model.normals, 3, this.app.gl.FLOAT)) throw new Error('cannot init a_Normal');
  }

  private setupTransforms(): void {
    const u_ModelMatrix = this.getUniformLocation('u_ModelMatrix');
    const u_NormalMatrix = this.getUniformLocation('u_NormalMatrix');
    const u_ViewMatrix = this.getUniformLocation('u_ViewMatrix');
    const u_ProjMatrix = this.getUniformLocation('u_ProjMatrix');
    this.app.gl.uniformMatrix4fv(u_ViewMatrix, false, this.setupView().elements);

    const modelMatrix = this.setupTranslation().concat(this.setupRotation()).concat(this.setupScale());
    const normalMatrix = new Matrix4();
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();

    this.app.gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    this.app.gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
    this.app.gl.uniformMatrix4fv(u_ProjMatrix, false, this.setupProjection().elements);
  }

  private setupLighting(): void {
    const a_TriangleColor = this.getAttribLocation('a_TriangleColor');
    const u_LightColor = this.getUniformLocation('u_LightColor');
    const u_UseDirectionalLight = this.getUniformLocation('u_UseDirectionalLight');
    const u_LightDirection = this.getUniformLocation('u_LightDirection');
    const u_LightPosition = this.getUniformLocation('u_LightPosition');

    if (this.app.lightingType == Constants.DIRECTIONAL_LIGHT) {
      this.app.gl.uniform1i(u_UseDirectionalLight, true);
    } else {
      this.app.gl.uniform1i(u_UseDirectionalLight, false);
    }

    this.app.gl.uniform3fv(u_LightColor, Constants.lightColor.elements);
    this.app.gl.uniform3f(u_LightDirection, this.app.directionalLight.x, this.app.directionalLight.y, this.app.directionalLight.z);
    this.app.gl.uniform3f(u_LightPosition, this.app.pointLight.x, this.app.pointLight.y, this.app.pointLight.z);
    this.app.gl.vertexAttrib4fv(a_TriangleColor, Constants.triangleColor.elements);
  }

  private setupPointStyles(): void {
    const a_PointSize = this.getAttribLocation('a_PointSize');
    const u_PointColor1 = this.getUniformLocation('u_PointColor1');
    const u_PointColor2 = this.getUniformLocation('u_PointColor2');
    const u_UseStaticColor = this.getUniformLocation('u_UseStaticColor');
    const u_FancyPoints = this.getUniformLocation('u_FancyPoints');

    if (this.app.entityType == Constants.VERTEX) {
      this.app.gl.uniform1i(u_UseStaticColor, true); // If rendering points, render single color

      if (this.app.pointStyleChoice == PointStyle.Fancy) {
        this.app.gl.uniform1i(u_FancyPoints, true);
      } else {
        this.app.gl.uniform1i(u_FancyPoints, false);
      }
    }
    else {
      this.app.gl.uniform1i(u_UseStaticColor, false); // Otherwise, each fragment/face gets its own color
    }
    this.app.gl.uniform4fv(u_PointColor1, Constants.pointColor1.elements);
    this.app.gl.uniform4fv(u_PointColor2, Constants.pointColor2.elements);
    this.app.gl.vertexAttrib1f(a_PointSize, Constants.pointSize);

  }
  private getCanvas(): HTMLElement | null {
    const canvas: HTMLElement | null = document.getElementById('gl_canvas');
    if (!canvas) {
      console.log('Failed to get canvas');
      return null;
    }
    return canvas;
  }

  public scaleCanvas(): void {
    if (this.app.gl) {
      const devicePixelRatio = window.devicePixelRatio || 1;
      console.log(`devicePixelRation: ${devicePixelRatio}`);
      if ((this.app.gl.canvas.width !== this.app.gl.canvas.clientWidth) || (this.app.gl.canvas.height !== this.app.gl.canvas.clientHeight)) {
        console.log(`scaleCanvas: canvas.width ${this.app.gl.canvas.width}, canvas.height ${this.app.gl.canvas.height}, canvas.clientWidth ${this.app.gl.canvas.clientWidth}, canvas.clientHeight ${this.app.gl.canvas.clientHeight} `);
        this.app.gl.canvas.width = this.app.gl.canvas.clientWidth * devicePixelRatio;
        this.app.gl.canvas.height = this.app.gl.canvas.clientHeight * devicePixelRatio;
      }
      this.app.gl.viewport(0, 0, this.app.gl.canvas.width, this.app.gl.canvas.height);
    }
  }

  public logState(): void {
    console.log(this.app.projectionType);
    console.log(this.app.entityType);
    console.log(this.app.lightingType);
    Constants.print();
  }

  // Main method:  Bind vertex and other buffers, set up transforms, lighting, shading, and point styles
  public loadGLData(gl: any): number {
    const model = this.app.models.get(this.app.modelChoice);
    if (!model) {
      return 0; // model not loaded yet
    }
    const pointCount = this.setupIndexBuffer(model);
    this.setupGeometryBuffer(model);
    this.setupTransforms();
    this.setupLighting();
    this.setupPointStyles();
    return pointCount;
  }
}