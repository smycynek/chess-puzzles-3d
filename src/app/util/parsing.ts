import { BoardFile, Model, Color } from '../constants';

export class Square {
  constructor(public file: BoardFile, public rank: number) {
  }
}
export class Unit {
  constructor(public color: Color, public unit: Model) {
  }
}

export class Assignment {
  constructor(public unit: Unit, public square: Square) {
  }
}

const fileMap: Map<string, BoardFile> = new Map<string, BoardFile>([
  ['a', BoardFile.a],
  ['b', BoardFile.b],
  ['c', BoardFile.c],
  ['d', BoardFile.d],
  ['e', BoardFile.e],
  ['f', BoardFile.f],
  ['g', BoardFile.g],
  ['h', BoardFile.h]]);

const pieceMap = new Map<string, Model>([
  ['K', Model.King],
  ['Q', Model.Queen],
  ['P', Model.Pawn],
  ['R', Model.Rook],
  ['B', Model.Bishop],
  ['N', Model.Knight]
]);

export const parseSquareString = (position: string) => {
  if (position.length !== 4) {
    // eslint-disable-next-line no-console
    throw (`Error, bad position string ${position}`);
  }
  const colorChar = position[0];
  const unitChar = position[1];
  const fileChar = position[2];
  const rankChar = position[3];

  const color = colorChar === 'w' ? Color.White : Color.Black;
  const piece = pieceMap.get(unitChar);
  if (!piece) {
    throw ('Error, bad piece notation');
  }
  const file = fileMap.get(fileChar);
  if (!file) {
    throw ('Error, bad file notation');
  }
  const rank = Number(rankChar);
  if (rank < 1 || rank > 8) {
    throw ('Error, bad rank notation');
  }
  return new Assignment(new Unit(color, piece),
    new Square(file, rank)
  );
};
