import { Vector3, Vector4 } from './lib/math';


export enum Color {
  White = 0,
  Black = 1,
  Light = 3,
  Dark = 4,
  Frame = 5,
}

export enum BoardFile {
  a = 1,
  b = 2,
  c = 3,
  d = 4,
  e = 5,
  f = 6,
  g = 7,
  h = 8,
}
export enum Model {
  Pawn = 1,
  Knight = 2,
  Bishop = 3,
  Rook = 4,
  Queen = 5,
  King = 6,
  Square = 7,
  Frame = 8,
}


export class Constants {

  public static readonly fischerPuzzle = 'bRg8,bKh8,bPc7,bPg7,bPh7,bPa6,bPc6,bQf4,bBe3,bPd5,wPg6,wPf5,wPh5,wPa4,wPe4,wPd3,wQb2,wPg2,wRb1,wKh1';

  public static readonly ORTHO = 'ORTHO';
  public static readonly PERSPECTIVE = 'PERSPECTIVE';

  public static readonly lightColor: Vector3 = new Vector3([1.0, 1.0, 1.0]);

  public static readonly pieceColorWhite: Vector4 = new Vector4([0.75, 0.75, .75, 1]);
  public static readonly pieceColorBlack: Vector4 = new Vector4([.35, .3, .25, 1.0]);

  public static readonly squareColorDark: Vector4 = new Vector4([0.3, 0.7, 0.3, 1]);
  public static readonly frameColor: Vector4 = new Vector4([0.5, 0.4, 0.4, 1]);
  public static readonly squareColorLight: Vector4 = new Vector4([1, 1, 1, 1]);
  public static readonly colorSpecular: Vector4 = new Vector4([1, 1, 1, 1]);
  public static toString(): string {
    const data = `
---Static/Constant data------
lightColor: ${Constants.lightColor.elements}
`;
    return data;
  }

  public static print(): void {
    console.log(Constants.toString());
  }
}

export class Dimensions {
  public static readonly squareWidth = 0.57;
}