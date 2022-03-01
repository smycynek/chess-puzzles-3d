import { Constants } from './constants';
import { Ortho, Perspective, Triple, tripleUniform } from './util/containers';

// Note, right-handed coords, +Z out of screen to user, -Z away from the user.
export class Defaults {

  public static readonly pointLightWhite: Triple = new Triple(2, 15, 2);
  public static readonly pointLightBlack: Triple = new Triple(2, 10, -2);
  public static readonly pointLight: Triple = new Triple(10, 40, -5);
  public static readonly translation: Triple = new Triple(0, 0, 0);
  public static readonly scale: Triple = tripleUniform(20);
  public static readonly eyeWhite: Triple = new Triple(3, 7.0, 9.5);
  public static readonly eyeBlack: Triple = new Triple(-3, 7.0, -9.5);
  public static readonly up: Triple = new Triple(0, 1, 0);
  public static readonly lookWhite: Triple = new Triple(0, 0.0, 0);
  public static readonly lookBlack: Triple = new Triple(0, 0, 0);
  public static readonly ortho = new Ortho(-7.6, 7.6, -6.4, 6.4, -40, 40);
  public static readonly perspective = new Perspective(58, 600 / 500.0, 0.1, 100);
  public static readonly projectionType: string = Constants.PERSPECTIVE;
  public static readonly whiteQueenLook = new Triple(0, -2, 0);
  public static readonly whiteQueenEye = new Triple(-2, 20, 30);
  public static readonly orthoEye = new Triple(0, 10, 1);
  public static readonly orthoPointLight = new Triple(.2, 50, 1);
  public static readonly orthoLook = new Triple(0, 2, 0);

}
