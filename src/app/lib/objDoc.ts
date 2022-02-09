/* eslint-disable no-var */
// Adjusted for TypeScript
// OBJViewer.js (c) 2012 matsuda and itami
import { Vector3 } from './math';

// ------------------------------------------------------------------------------
// OBJParser
// ------------------------------------------------------------------------------


export function readOBJFile(fileName: string, gl: any, model: any, scale: number, reverse: boolean) {
  const request = new XMLHttpRequest();
  request.onreadystatechange = function () {
    if (request.readyState === 4 && request.status !== 404) {
      onReadOBJFile(request.responseText, fileName, gl, scale, reverse);
    }
  };
  request.open('GET', fileName, true); // Create a request to acquire the file
  request.send();                      // Send the request
}
let g_objDoc;

export function onReadOBJFile(fileString: string, fileName: string, gl: any, scale: number, reverse: boolean) {
  const objDoc = new OBJDoc(fileName);  // Create a OBJDoc object
  const result = objDoc.parse(fileString, scale, reverse); // Parse the file
  if (!result) {
    console.log('OBJ file parsing error.');
    return;
  }
  g_objDoc = objDoc;
}

// Analyze the material file
function onReadMTLFile(fileString: string, mtl: any) {
  const lines: Array<string | null> = fileString.split('\n');  // Break up into lines and store them as array
  lines.push(null);           // Append null
  let index = 0;              // Initialize index of line

  // Parse line by line
  let line;      // A string in the line to be parsed
  let name = ''; // Material name
  let sp: StringParser;
  while ((line = lines[index++]) != null) {
    sp = new StringParser(line);               // init StringParser
    const command = sp.getWord();     // Get command
    if (command == null) continue;  // check null command

    switch (command) {
    case '#':
      continue;    // Skip comments
    case 'newmtl': // Read Material chunk
      name = mtl.parseNewmtl(sp);    // Get name
      continue; // Go to the next line
    case 'Kd':   // Read normal
      if (name == '') continue; // Go to the next line because of Error
      mtl.materials.push(mtl.parseRGB(sp, name));
      name = '';
      continue; // Go to the next line
    }
  }
  mtl.complete = true;
}

// OBJDoc object
// Constructor


export class OBJDoc {
  private fileName: string;
  private mtls: any;
  private objects: Array<OBJObject>;
  private vertices: Array<Vertex>;
  private normals: Array<Normal>;

  constructor(fileName: string) {
    this.fileName = fileName;
    this.mtls = new Array(0);      // Initialize the property for MTL
    this.objects = new Array(0);   // Initialize the property for Object
    this.vertices = new Array(0);  // Initialize the property for Vertex
    this.normals = new Array(0);   // Initialize the property for Normal
  }

  // Parsing the OBJ file
  public parse(fileString: string, scale: number, reverse: boolean) {
    const lines: Array<string | null> = fileString.split('\n');  // Break up into lines and store them as array
    lines.push(null); // Append null
    let index = 0;    // Initialize index of line
    console.log('Parse ' + this.fileName);
    let currentObject = null;
    let currentMaterialName = '';

    // Parse line by line
    let line;         // A string in the line to be parsed
    let sp: StringParser;   // Create StringParser
    while ((line = lines[index++]) != null) {
      sp = new StringParser(line);                  // init StringParser
      const command = sp.getWord();     // Get command
      if (command == null) continue;  // check null command

      switch (command) {
      case '#':
        continue;  // Skip comments
        continue; // Go to the next line
      case 'o':
      case 'g':   // Read Object name
        var object = this.parseObjectName(sp);
        this.objects.push(object);
        currentObject = object;
        continue; // Go to the next line
      case 'v':   // Read vertex
        var vertex = this.parseVertex(sp, scale);
        this.vertices.push(vertex);
        continue; // Go to the next line
      case 'vn':   // Read normal
        var normal = this.parseNormal(sp);
        this.normals.push(normal);
        continue; // Go to the next line
      case 'usemtl': // Read Material name
        currentMaterialName = this.parseUsemtl(sp);
        continue; // Go to the next line
      case 'f': // Read face
        var face = this.parseFace(sp, currentMaterialName, this.vertices, reverse);
        if (currentObject) {
          currentObject.addFace(face);
        }
        continue; // Go to the next line
      }
    }

    return true;
  }

  private parseMtllib(sp: any, fileName: string) {
    // Get directory path
    const i = fileName.lastIndexOf('/');
    let dirPath = '';
    if (i > 0) dirPath = fileName.substr(0, i + 1);

    return dirPath + sp.getWord();   // Get path
  }

  private parseObjectName(sp: any) {
    const name = sp.getWord();
    return (new OBJObject(name));
  }
  private parseVertex = function (sp: any, scale: number) {
    const x = sp.getFloat() * scale;
    const y = sp.getFloat() * scale;
    const z = sp.getFloat() * scale;
    return (new Vertex(x, y, z));
  };

  private parseNormal(sp: any) {
    const x = sp.getFloat();
    const y = sp.getFloat();
    const z = sp.getFloat();
    return (new Normal(x, y, z));
  }

  private parseUsemtl(sp: any) {
    return sp.getWord();
  }

  private parseFace(sp: StringParser, materialName: string, vertices: any, reverse: boolean) {
    const face = new Face(materialName);
    // get indices
    for (; ;) {
      const word = sp.getWord();
      if (word == null) break;
      const subWords = word.split('/');
      if (subWords.length >= 1) {
        const vi = parseInt(subWords[0]) - 1;
        face.vIndices.push(vi);
      }
      if (subWords.length >= 3) {
        const ni = parseInt(subWords[2]) - 1;
        face.nIndices.push(ni);
      } else {
        face.nIndices.push(-1);
      }
    }

    // calc normal
    const v0 = [
      vertices[face.vIndices[0]].x,
      vertices[face.vIndices[0]].y,
      vertices[face.vIndices[0]].z];
    const v1 = [
      vertices[face.vIndices[1]].x,
      vertices[face.vIndices[1]].y,
      vertices[face.vIndices[1]].z];
    const v2 = [
      vertices[face.vIndices[2]].x,
      vertices[face.vIndices[2]].y,
      vertices[face.vIndices[2]].z];

    //
    let normal = calcNormal(v0, v1, v2);
    //
    if (normal == null) {
      if (face.vIndices.length >= 4) { //
        const v3 = [
          vertices[face.vIndices[3]].x,
          vertices[face.vIndices[3]].y,
          vertices[face.vIndices[3]].z];
        normal = calcNormal(v1, v2, v3);
      }
      if (normal == null) {
        normal = new Float32Array([0.0, 1.0, 0.0]);
      }
    }
    if (reverse) {
      normal[0] = -normal[0];
      normal[1] = -normal[1];
      normal[2] = -normal[2];
    }
    face.normal = new Normal(normal[0], normal[1], normal[2]);

    // Divide to triangles if face contains over 3 points.
    if (face.vIndices.length > 3) {
      const n = face.vIndices.length - 2;
      const newVIndices = new Array(n * 3);
      const newNIndices = new Array(n * 3);
      for (let i = 0; i < n; i++) {
        newVIndices[i * 3 + 0] = face.vIndices[0];
        newVIndices[i * 3 + 1] = face.vIndices[i + 1];
        newVIndices[i * 3 + 2] = face.vIndices[i + 2];
        newNIndices[i * 3 + 0] = face.nIndices[0];
        newNIndices[i * 3 + 1] = face.nIndices[i + 1];
        newNIndices[i * 3 + 2] = face.nIndices[i + 2];
      }
      face.vIndices = newVIndices;
      face.nIndices = newNIndices;
    }
    face.numIndices = face.vIndices.length;

    return face;
  }


  // Check Materials
  private isMTLComplete() {
    if (this.mtls.length == 0) return true;
    for (let i = 0; i < this.mtls.length; i++) {
      if (!this.mtls[i].complete) return false;
    }
    return true;
  }

  // Find color by material name
  private findColor(name: string) {
    for (let i = 0; i < this.mtls.length; i++) {
      for (let j = 0; j < this.mtls[i].materials.length; j++) {
        if (this.mtls[i].materials[j].name == name) {
          return (this.mtls[i].materials[j].color);
        }
      }
    }
    return (new Color(0.8, 0.8, 0.8, 1));
  }

  // ------------------------------------------------------------------------------
  // Retrieve the information for drawing 3D model
  public getDrawingInfo() {
    // Create an arrays for vertex coordinates, normals, colors, and indices
    let numIndices = 0;
    for (var i = 0; i < this.objects.length; i++) {
      numIndices += this.objects[i].numIndices;
    }
    const numVertices = numIndices;
    const vertices = new Float32Array(numVertices * 3);
    const normals = new Float32Array(numVertices * 3);
    const colors = new Float32Array(numVertices * 4);
    const indices = new Uint16Array(numIndices);

    // Set vertex, normal and color
    let index_indices = 0;
    for (var i = 0; i < this.objects.length; i++) {
      const object = this.objects[i];
      for (let j = 0; j < object.faces.length; j++) {
        const face = object.faces[j];
        const color = this.findColor(face.materialName);
        const faceNormal = face.normal;
        for (let k = 0; k < face.vIndices.length; k++) {
          // Set index
          indices[index_indices] = index_indices;
          // Copy vertex
          const vIdx = face.vIndices[k];
          const vertex = this.vertices[vIdx];
          vertices[index_indices * 3 + 0] = vertex.x;
          vertices[index_indices * 3 + 1] = vertex.y;
          vertices[index_indices * 3 + 2] = vertex.z;
          // Copy color
          colors[index_indices * 4 + 0] = color.r;
          colors[index_indices * 4 + 1] = color.g;
          colors[index_indices * 4 + 2] = color.b;
          colors[index_indices * 4 + 3] = color.a;
          // Copy normal
          const nIdx = face.nIndices[k];
          if (nIdx >= 0) {
            const normal = this.normals[nIdx];
            normals[index_indices * 3 + 0] = normal.x;
            normals[index_indices * 3 + 1] = normal.y;
            normals[index_indices * 3 + 2] = normal.z;
          } else {
            normals[index_indices * 3 + 0] = faceNormal.x;
            normals[index_indices * 3 + 1] = faceNormal.y;
            normals[index_indices * 3 + 2] = faceNormal.z;
          }
          index_indices++;
        }
      }
    }

    return new DrawingInfo(vertices, normals, colors, indices);
  }
}


// ------------------------------------------------------------------------------
// Material Object
// ------------------------------------------------------------------------------
export class Material {
  name: any;
  color: Color;
  constructor(name:string, r:number, g:number, b:number, a:number) {
    this.name = name;
    this.color = new Color(r, g, b, a);
  }
}

// ------------------------------------------------------------------------------
// Vertex Object
// ------------------------------------------------------------------------------
export class Vertex {
  x: number;
  y: number;
  z: number;
  constructor(x:number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
}

// ------------------------------------------------------------------------------
// Normal Object
// ------------------------------------------------------------------------------
export class Normal {
  x: number;
  y: number;
  z: number;
  constructor(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
}

// ------------------------------------------------------------------------------
// Color Object
// ------------------------------------------------------------------------------
export class Color {
  r: number;
  g: number;
  b: number;
  a: number;
  constructor(r: number, g: number, b: number, a: number) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }
}

// ------------------------------------------------------------------------------
// OBJObject Object
// ------------------------------------------------------------------------------
export class OBJObject {
  name: string;
  faces: Array<Face>;
  numIndices: number;
  constructor(name: string) {
    this.name = name;
    this.faces = new Array(0);
    this.numIndices = 0;
  }


  public addFace(face: Face) {
    this.faces.push(face);
    this.numIndices += face.numIndices;
  }
}

// ------------------------------------------------------------------------------
// Face Object
// ------------------------------------------------------------------------------
export class Face {
  vIndices: Array<number>;
  nIndices: any;
  numIndices: any;
  materialName: any;
  normal: Normal;
  constructor(materialName: string) {
    this.materialName = materialName;
    if (materialName == null) this.materialName = '';
    this.vIndices = new Array(0);
    this.nIndices = new Array(0);
    this.normal = new Normal(0, 0, 1);
  }
}

// ------------------------------------------------------------------------------
// DrawInfo Object
// ------------------------------------------------------------------------------
export class DrawingInfo {
  vertices: Float32Array;
  normals: Float32Array;
  colors: Float32Array;
  indices: Uint16Array;
  constructor(vertices: Float32Array, normals: Float32Array, colors: Float32Array, indices: Uint16Array) {
    this.vertices = vertices;
    this.normals = normals;
    this.colors = colors;
    this.indices = indices;
  }
}

// ------------------------------------------------------------------------------
// Constructor
export class StringParser {
  str: string;
  index: number;

  // Initialize StringParser object
  constructor(str: string) {
    this.str = str;
    this.index = 0;
  }

  // Skip delimiters
  private skipDelimiters() {
    for (var i = this.index, len = this.str.length; i < len; i++) {
      const c = this.str.charAt(i);
      // Skip TAB, Space, '(', ')
      if (c == '\t' || c == ' ' || c == '(' || c == ')' || c == '"') continue;
      break;
    }
    this.index = i;
  }

  // Skip to the next word
  private skipToNextWord() {
    this.skipDelimiters();
    const n = getWordLength(this.str, this.index);
    this.index += (n + 1);
  }

  // Get word
  public getWord() : string | null {
    this.skipDelimiters();
    const n = getWordLength(this.str, this.index);
    if (n == 0) return null;
    const word = this.str.substr(this.index, n);
    this.index += (n + 1);
    return word;
  }

  // Get integer
  public getInt() {
    const word = this.getWord();
    if (word) {
      return parseInt(word);
    }
    return 0;
  }

  // Get floating number
  public getFloat() {
    const word = this.getWord();
    if (word) {
      return parseFloat(word);
    }
    return 0;
  }
}

// Get the length of word
function getWordLength(str: string, start: number) {
  const n = 0;
  for(var i = start, len = str.length; i < len; i++){
    const c = str.charAt(i);
    if (c == '\t' || c == ' ' || c == '(' || c == ')' || c == '"')
      break;
  }
  return i - start;
}

// ------------------------------------------------------------------------------
// Common function
// ------------------------------------------------------------------------------
function calcNormal(p0: Array<number>, p1: Array<number>, p2: Array<number>) {
  // v0: a vector from p1 to p0, v1; a vector from p1 to p2
  const v0 = new Float32Array(3);
  const v1 = new Float32Array(3);
  for (let i = 0; i < 3; i++){
    v0[i] = p0[i] - p1[i];
    v1[i] = p2[i] - p1[i];
  }

  // The cross product of v0 and v1
  const c = new Float32Array(3);
  c[0] = v0[1] * v1[2] - v0[2] * v1[1];
  c[1] = v0[2] * v1[0] - v0[0] * v1[2];
  c[2] = v0[0] * v1[1] - v0[1] * v1[0];

  // Normalize the result
  const v = new Vector3(Array.prototype.slice.call(c));
  v.normalize();
  return v.elements;
}
