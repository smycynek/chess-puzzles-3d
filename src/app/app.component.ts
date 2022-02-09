import { Component } from '@angular/core';

import fragmentShaderSrc from '../assets/shaders/fragment-shader.glsl';
import vertexShaderSrc from '../assets/shaders/vertex-shader.glsl';
import { Constants, ModelChoice, PointStyle } from './constants';
import { Defaults } from './defaults';
import { Implementation } from './implementation';
import { GlUtil } from './lib/glUtil';
import { DrawingInfo, OBJDoc } from './lib/objDoc';
import { UiCallbacks } from './uiCallbacks';
import { Model, Ortho, Triple } from './util/containers';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.template.html',
  styles: []
})
export class AppComponent {
  // startup, spin control
  constructor() {
    this.handler.spin();
  }

  // This 2 fields make a very primitive Cheshire cat pattern to keep this file size smaller
  public handler = new UiCallbacks(this);
  public implementation = new Implementation(this);

  public init = false;
  public spinning = true;
  public logging = false;
  public gl: any = null;
  private shaderProgram: any = null;

  // Vertex data from stock obj files and uploaded files
  public models: Map<ModelChoice, Model> = new Map<ModelChoice, Model>();

  // Basic choices/toggles
  public pointStyleChoice: PointStyle = Defaults.pointStyle;
  public modelChoice: ModelChoice = Defaults.modelChoice;
  public lightingType: string = Defaults.lightingType;
  public entityType: string = Defaults.entityType;
  public projectionType = Defaults.projectionType;

  // Basic transforms
  public translate: Triple = Defaults.translation;
  public rotation: Triple = Defaults.rotation;
  public scale: Triple = Defaults.scale;

  // View control
  public eye: Triple = Defaults.eye;
  public up: Triple = Defaults.up;
  public look: Triple = Defaults.look;

  // Lighting positions
  public directionalLight: Triple = Defaults.directionalLight;
  public pointLight: Triple = Defaults.pointLight;

  // Projection parameters
  public ortho: Ortho = Defaults.ortho;
  public perspective = Defaults.perspective;

  // GetWebGL context, load models, init shaders, and call start() to start rendering
  public initScreen() {
    if (!this.init) {
      this.init = true;
      this.gl = this.implementation.getContext();

      if (!this.gl) {
        throw Error('No WebGL context available.');
      }

      this.shaderProgram = GlUtil.createProgram(this.gl, vertexShaderSrc, fragmentShaderSrc);

      this.gl.useProgram(this.shaderProgram);
      this.gl.program = this.shaderProgram;

      fetch('assets/models/nin.obj')
        .then(response => response.text())
        .then(data => {
          const parsedObj: OBJDoc = new OBJDoc('nin.obj');
          parsedObj.parse(data, 1, true);
          const drawingInfo: DrawingInfo = parsedObj.getDrawingInfo();
          const nin: Model = new Model(drawingInfo.vertices, drawingInfo.normals, drawingInfo.indices, 10);
          this.models.set(ModelChoice.NineInchNails, nin);
        }).then(() => {
          fetch('assets/models/rook.obj')
            .then(response => response.text())
            .then(data => {
              const parsedObj: OBJDoc = new OBJDoc('rook.obj');
              parsedObj.parse(data, 1, true);
              const drawingInfo: DrawingInfo = parsedObj.getDrawingInfo();
              const rook: Model = new Model(drawingInfo.vertices, drawingInfo.normals, drawingInfo.indices, 1.5);
              this.models.set(ModelChoice.ChessRook, rook);
            });
        }).then(() => {
          fetch('assets/models/box_hole.obj')
            .then(response => response.text())
            .then(data => {
              const parsedObj: OBJDoc = new OBJDoc('box_hole.obj');
              parsedObj.parse(data, 1, true);
              const drawingInfo: DrawingInfo = parsedObj.getDrawingInfo();
              const cube: Model = new Model(drawingInfo.vertices, drawingInfo.normals, drawingInfo.indices, 1.5);
              this.models.set(ModelChoice.Cube, cube);
              this.start();
            });
        });
    }
  }

  // Set up data in WebGL context, call drawArrays/drawElements
  public start(): void {
    const gl = this.gl;
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BIT);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    this.implementation.scaleCanvas();
    const pointCount = this.implementation.loadGLData(gl);
    if (pointCount <= 0) {
      return;
    }
    if (this.logging) {
      this.implementation.logState();
    }

    if (this.entityType == Constants.VERTEX) {
      gl.drawArrays(gl.POINTS, 0, pointCount);
    }
    else {
      gl.drawElements(gl.TRIANGLES, pointCount, gl.UNSIGNED_SHORT, 0);
    }
  }

}
