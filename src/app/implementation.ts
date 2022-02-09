import { AppComponent } from './app.component';
import { BoardFile, Color, Constants, ModelChoice } from './constants';
import { Matrix4 } from './lib/math';
import { Triple } from './util/containers';

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
      gl = canvas.getContext('webgl2', { antialias: true });
      if (!gl) {
        console.log('Failed to get the rendering context for WebGL 2.0');
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

  private setupRotation(modelChoice: ModelChoice, color: Color): Matrix4 {
    let rotationMatrix = new Matrix4();
    let y = this.app.rotation.y;
    if ((modelChoice == ModelChoice.Bishop) || (modelChoice == ModelChoice.King)) {
      y = -90;
    }
    if ((modelChoice == ModelChoice.Knight) && (color == Color.Black)) {
      y = 225;
    }
    if ((modelChoice == ModelChoice.Knight) && (color == Color.White)) {
      y = -45;
    }
    rotationMatrix = rotationMatrix.rotate(this.app.rotation.x, 1, 0, 0);
    rotationMatrix = rotationMatrix.rotate(y, 0, 1, 0);
    rotationMatrix = rotationMatrix.rotate(0, 0, 0, 1);
    return rotationMatrix;
  }

  private position(rank: number, file: BoardFile, model: ModelChoice) {
    const xOffset = .57;
    const zOffset = .57;
    const x = (xOffset * 2 * file.valueOf()) + xOffset - (1.4 * 4) - 0.3;
    let z = (zOffset * -2 * rank) - zOffset + (1.4 * 4);
    let y = 0;
    if (model == ModelChoice.Square) {
      y = .58;
      z -= .6;
    }
    return new Triple(x, y, z);
  }

  private setupTranslation(rank: number, file: BoardFile, modelChoice: ModelChoice): Matrix4 {
    const translationMatrix = new Matrix4();
    const position = this.position(rank, file, modelChoice);
    translationMatrix.setTranslate(this.app.translate.x + position.x, this.app.translate.y + position.y, this.app.translate.z + position.z);
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

  private setupTransforms(rank: number, file: BoardFile, modelChoice: ModelChoice, color: Color): void {
    const u_ModelMatrix = this.getUniformLocation('u_ModelMatrix');
    const u_NormalMatrix = this.getUniformLocation('u_NormalMatrix');
    const u_ViewMatrix = this.getUniformLocation('u_ViewMatrix');
    const u_ProjMatrix = this.getUniformLocation('u_ProjMatrix');
    this.app.gl.uniformMatrix4fv(u_ViewMatrix, false, this.setupView().elements);

    const modelMatrix = this.setupTranslation(rank, file, modelChoice).concat(this.setupRotation(modelChoice, color)).concat(this.setupScale());
    const normalMatrix = new Matrix4();
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();

    this.app.gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    this.app.gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
    this.app.gl.uniformMatrix4fv(u_ProjMatrix, false, this.setupProjection().elements);
  }

  private setupLighting(color: Color): void {
    const u_AmbientColor = this.getUniformLocation('u_AmbientColor');
    const u_DiffuseColor = this.getUniformLocation('u_DiffuseColor');
    const u_SpecularColor = this.getUniformLocation('u_SpecularColor');
    const u_LightColor = this.getUniformLocation('u_LightColor');
    const u_LightPosition = this.getUniformLocation('u_LightPosition');

    this.app.gl.uniform3fv(u_LightColor, Constants.lightColor.elements);
    this.app.gl.uniform3f(u_LightPosition, this.app.pointLight.x, this.app.pointLight.y, this.app.pointLight.z);
    this.app.gl.uniform4fv(u_SpecularColor, Constants.colorSpecular.elements);
    switch (color) {
    case Color.Black:
      this.app.gl.uniform4fv(u_AmbientColor, Constants.pieceColorBlack.elements);
      this.app.gl.uniform4fv(u_DiffuseColor, Constants.pieceColorBlack.elements);
      break;
    case Color.White:
      this.app.gl.uniform4fv(u_AmbientColor, Constants.pieceColorWhite.elements);
      this.app.gl.uniform4fv(u_DiffuseColor, Constants.pieceColorWhite.elements);
      break;
    case Color.Dark:
      this.app.gl.uniform4fv(u_AmbientColor, Constants.squareColorDark.elements);
      this.app.gl.uniform4fv(u_DiffuseColor, Constants.squareColorDark.elements);
      break;
    case Color.Light:
      this.app.gl.uniform4fv(u_AmbientColor, Constants.squareColorLight.elements);
      this.app.gl.uniform4fv(u_DiffuseColor, Constants.squareColorLight.elements);
      break;
    }
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
      if ((this.app.gl.canvas.width !== this.app.gl.canvas.clientWidth) || (this.app.gl.canvas.height !== this.app.gl.canvas.clientHeight)) {
        const devicePixelRatio = window.devicePixelRatio || 1;
        console.log(`scaleCanvas: canvas.width ${this.app.gl.canvas.width}, canvas.height ${this.app.gl.canvas.height}, canvas.clientWidth ${this.app.gl.canvas.clientWidth}, canvas.clientHeight ${this.app.gl.canvas.clientHeight} `);
        this.app.gl.canvas.width = this.app.gl.canvas.clientWidth * devicePixelRatio;
        this.app.gl.canvas.height = this.app.gl.canvas.clientHeight * devicePixelRatio;
      }
      this.app.gl.viewport(0, 0, this.app.gl.canvas.width, this.app.gl.canvas.height);
    }
  }

  public logState(): void {
    console.log(this.app.projectionType);
    console.log(this.app.lightingType);
    Constants.print();
  }

  // Main method:  Bind vertex and other buffers, set up transforms, lighting, shading, and point styles
  public loadGLData(gl: any, rank: number, file: BoardFile, color: Color, modelChoice: ModelChoice): number {
    const model = this.app.models.get(modelChoice);
    if (model) {
      model.activate();
      this.setupTransforms(rank, file, modelChoice, color);
      this.setupLighting(color);
      if (model) {
        return model.indices.length;
      }
    }
    throw Error('No data!');
  }
}