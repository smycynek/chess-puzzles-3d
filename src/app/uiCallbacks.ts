import { AppComponent } from './app.component';
import { Constants } from './constants';
import { Perspective, Triple } from './util/containers';

import { Defaults } from './defaults';
let globalApp: AppComponent;

// Used by main Angular AppComponent for button/input handlers
export class UiCallbacks {
  constructor(public app: AppComponent) {
    globalApp = this.app;
  }

  public toggleSpinMode() {
    this.app.spinning = !this.app.spinning;
    this.spin();
  }


  public toggleShow(): void {
    this.app.showAnswer = !this.app.showAnswer;
  }

  public setOrthoMode() {
    this.app.projectionType = Constants.ORTHO;
    this.app.translate = Defaults.translation.clone();
    this.app.scale = Defaults.scale.clone();
    this.app.eye = Defaults.orthoEye.clone();
    this.app.pointLight = Defaults.orthoPointLight.clone();
    this.app.perspective = Defaults.perspective.clone();
    this.app.look = Defaults.orthoLook.clone();
    this.app.start();
  }

  public setPerspectiveModeWhite() {
    this.app.projectionType = Constants.PERSPECTIVE;
    this.app.translate = Defaults.translation.clone();
    this.app.scale = Defaults.scale.clone();
    this.app.eye = Defaults.eyeWhite.clone();
    this.app.pointLight = Defaults.pointLightWhite.clone();
    this.app.perspective = Defaults.perspective.clone();
    this.app.look = Defaults.lookWhite.clone();
    this.app.start();
  }

  public setPerspectiveModeBlack() {
    this.app.projectionType = Constants.PERSPECTIVE;
    this.app.translate = Defaults.translation.clone();
    this.app.scale = Defaults.scale.clone();
    this.app.eye = Defaults.eyeBlack.clone();
    this.app.pointLight = Defaults.pointLightBlack.clone();
    this.app.perspective = Defaults.perspective.clone();
    this.app.look = Defaults.lookBlack.clone();
    this.app.start();
  }

  public setPerspectiveModeWhiteQueen() {
    this.app.projectionType = Constants.PERSPECTIVE;
    this.app.translate = Defaults.translation.clone();
    this.app.scale = Defaults.scale.clone();
    this.app.pointLight = new Triple(0.2, 20, 4.0); // need better way to manage all these
    this.app.perspective = new Perspective(5, (760.0 / 640.0), 0.1, 100);
    this.app.look = Defaults.whiteQueenLook.clone();
    this.app.eye = Defaults.whiteQueenEye.clone();
    this.app.start();
  }

  public onResize($event: any) {
    this.app.implementation.scaleCanvas();
    console.log('Resize');
    if (!this.app.spinning) {
      this.draw();
    }
  }

  public draw(): void {
    console.log('Draw');
    requestAnimationFrame(function () {
      globalApp.start();
    });
  }

  // Main animation loop
  public spin() {
    if (this.app.spinning) {
      requestAnimationFrame(function () {
        globalApp.orbit += .02;
        globalApp.eye.x = 20 * Math.cos(globalApp.orbit);
        globalApp.eye.z = 30 * Math.sin(globalApp.orbit);
        if (globalApp.orbit == 360) {
          globalApp.orbit = 0;
        }
        globalApp.start();
        globalApp.handler.spin();
      });
    }
  }
}