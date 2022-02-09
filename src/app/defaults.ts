import { Constants, ModelChoice, PointStyle } from './constants';
import { Ortho, Perspective, Triple, tripleUniform } from './util/containers';

// Note, right-handed coords, +Z out of screen to user, -Z away from the user.
export class Defaults {
  public static readonly modelChoice = ModelChoice.Cube;
  public static readonly pointStyle = PointStyle.Fancy;
  public static readonly directionalLight: Triple = new Triple(0.2, 0.4, 1.0);
  public static readonly pointLight: Triple = new Triple(1, 2, 3);
  public static readonly translation: Triple = tripleUniform(0);
  public static readonly rotation: Triple = tripleUniform(0);
  public static readonly scale: Triple = tripleUniform(1);
  public static readonly eye: Triple = new Triple(2.0, 2.0, 4.0);
  public static readonly up: Triple = new Triple(0, 1, 0);
  public static readonly look: Triple = tripleUniform(0);
  public static readonly ortho = new Ortho(-2, 2, -2, 2, -4, 4);
  public static readonly perspective = new Perspective(45, 1, 0.1, 100);
  public static readonly projectionType: string = Constants.PERSPECTIVE;
  public static readonly entityType = Constants.TRIANGLE;
  public static readonly lightingType = Constants.POINT_LIGHT;
}
