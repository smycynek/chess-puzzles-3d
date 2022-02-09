import { AppComponent } from './app.component';
import { Constants, ModelChoice, PointStyle } from './constants';
import { DrawingInfo, OBJDoc } from './lib/objDoc';
import { Model, tripleUniform } from './util/containers';
import { getRecommendedScale } from './util/scale';

let globalApp: AppComponent;

// Used by main Angular AppComponent for button/input handlers
export class UiCallbacks {
  constructor(public app: AppComponent) {
    globalApp = this.app;
  }

  // Methods for setting the active model
  public setCubeModel() {
    this.app.modelChoice = ModelChoice.Cube;
    this.app.rotation.x = 0;
    this.app.scale = tripleUniform(1.5);
    this.app.start();
  }

  public setRookModel() {
    this.app.modelChoice = ModelChoice.ChessRook;
    this.app.rotation.x = 0;
    this.app.scale = tripleUniform(2);
    this.app.start();
  }

  public setNinModel() {
    this.app.modelChoice = ModelChoice.NineInchNails;
    this.app.rotation.x = 0;
    this.app.scale = tripleUniform(10);
    this.app.start();
  }

  public setUploadedModel() {
    this.app.modelChoice = ModelChoice.UploadedFile;
    this.app.rotation.x = 0;
    const model = this.app.models.get(ModelChoice.UploadedFile);
    if (model) {
      this.app.scale = tripleUniform(model.scale);
    }
  }

  // Methods for other basic controls
  public setPointLightMode() {
    this.app.lightingType = Constants.POINT_LIGHT;
    this.app.start();
  }

  public toggleSpinMode() {
    this.app.spinning = !this.app.spinning;
    this.spin();
  }

  public setDirectionalLightMode() {
    this.app.lightingType = Constants.DIRECTIONAL_LIGHT;
    this.app.start();
  }

  public setPointMode() {
    this.app.entityType = Constants.VERTEX;
    this.app.start();
  }

  public setSimplePointsMode() {
    this.app.pointStyleChoice = PointStyle.Simple;
    this.app.start();
  }

  public setFancyPointsMode() {
    this.app.pointStyleChoice = PointStyle.Fancy;
    this.app.start();
  }


  public setTriangleMode() {
    this.app.entityType = Constants.TRIANGLE;
    this.app.start();
  }

  public setOrthoMode() {
    this.app.projectionType = Constants.ORTHO;
    this.app.eye.z = 1;
    this.app.start();
  }

  public setPerspectiveMode() {
    this.app.projectionType = Constants.PERSPECTIVE;
    this.app.eye.z = 4.0;
    this.app.start();
  }

  // Handler for uploading model files
  public onFileSelected($event: any) {
    const file: File = $event.target.files[0];
    if (file) {
      file.text().then(data => {
        const parsedObj: OBJDoc = new OBJDoc(file.name);
        parsedObj.parse(data, 1, true);
        const drawingInfo: DrawingInfo = parsedObj.getDrawingInfo();
        const uploaded = new Model(drawingInfo.vertices, drawingInfo.normals, drawingInfo.indices, getRecommendedScale(drawingInfo.vertices));
        this.app.models.set(ModelChoice.UploadedFile, uploaded);
        this.app.modelChoice = ModelChoice.UploadedFile;
        this.app.scale = tripleUniform(uploaded.scale);
        this.app.start();
      });
    }
  }

  public onResize($event: any) {
    this.app.implementation.scaleCanvas();
    console.log('Resize');
    if (!this.app.spinning) {
      this.draw();
    }
  }

  private draw(): void {
    console.log('Draw');
    requestAnimationFrame(function () {
      globalApp.start();
    });
  }

  // Main animation loop
  public spin() {
    if (this.app.spinning) {
      requestAnimationFrame(function () {
        globalApp.rotation.y += 1;
        if (globalApp.rotation.y == 360) {
          globalApp.rotation.y = 0;
        }
        globalApp.start();
        globalApp.handler.spin();
      });
    }
  }
}