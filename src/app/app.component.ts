import { Component, NgModule, OnInit } from '@angular/core';
import fragmentShaderSrc from '../assets/shaders/fragment-shader.glsl';
import vertexShaderSrc from '../assets/shaders/vertex-shader.glsl';
import { BoardFile, BoardView, Color, Model } from './constants';
import { Defaults } from './defaults';
import { Implementation } from './implementation';
import { GlUtil } from './lib/glUtil';
import { DrawingInfo, OBJDoc } from './lib/objDoc';
import { UiCallbacks } from './uiCallbacks';
import { MeshModel, Ortho, Triple } from './util/containers';
import { ActivatedRoute, RouterModule, Routes } from '@angular/router';
import { parseSquareString } from './util/parsing';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const rot13Cipher = require('rot13-cipher');

const routes: Routes = [];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

const headline = 'Try%20this%20chess%20puzzle.';

const twitterBase = 'http://twitter.com/share?text=';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.template.html',
  styles: []
})
export class AppComponent implements OnInit {

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.queryParams
      .subscribe(params => {
        console.log(params);
        this.data = params['data'] || '';
        this.question = params['question'] || '';
        this.answer = rot13Cipher(params['answer'] ? params['answer'] : '');
        this.reverseQuery = this.getReverseQuery(params);
        this.viewpoint = params['view'] == 'b' ? BoardView.Black : BoardView.White;
      }
      );
  }
  // startup, spin control

  public  getTwitterUrl() {
    const fullStr = encodeURIComponent(window.location.toString());
    return `${twitterBase}${headline}&url=${fullStr}&hashtags=chesspuzzle`;
  }

  private getReverseQuery(params: any): string {
    const base = 'https://stevenvictor.net/chess/#/chess/create/sknsk?';
    const data = params['data'];
    const question = params['question'];
    const answer = params['answer'];
    const view = params['view'];
    const dataParam = data ? `data=${encodeURIComponent(data)}` : '';
    const questionParam = question ? `&question=${encodeURIComponent(question)}` : '';
    const answerParam = answer ? `&answer=${encodeURIComponent(answer)}` : '';
    const editModeParam = '&editMode=true';
    const viewParam = `&view=${view}`;
    return `${base}${dataParam}${questionParam}${answerParam}${editModeParam}${viewParam}`;
  }

  // This 2 fields make a very primitive Cheshire cat pattern to keep this file size smaller
  public handler = new UiCallbacks(this);
  public implementation = new Implementation(this);

  public init = false;
  public spinning = false;
  public logging = false;
  public gl: any = null;
  private shaderProgram: any = null;

  // Vertex data from stock obj files and uploaded files
  public models: Map<Model, MeshModel> = new Map<Model, MeshModel>();

  // Basic choices/toggles

  public projectionType = Defaults.projectionType;

  // Basic transforms
  public translate: Triple = Defaults.translation.clone();
  public scale: Triple = Defaults.scale.clone();

  // View control
  public eye: Triple = Defaults.eyeWhite.clone();
  public up: Triple = Defaults.up.clone();
  public look: Triple = Defaults.lookWhite.clone();
  public orbit = 0;
  // Lighting positions

  public pointLight: Triple = Defaults.pointLightWhite.clone();

  // Projection parameters
  public ortho: Ortho = Defaults.ortho.clone();
  public perspective = Defaults.perspective.clone();
  public data = ''; // Constants.fischerPuzzle;
  public question = ''; // Constants.fischerPuzzle;
  public answer = ''; // Constants.fischerPuzzle;
  public reverseQuery = '';
  public showAnswer = false;
  public viewpoint = BoardView.White;

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

      fetch('assets/models/rook_layout.obj')
        .then(response => response.text())
        .then(data => {
          const parsedObj: OBJDoc = new OBJDoc('rook_layout.obj');
          parsedObj.parse(data, 1, true);
          const drawingInfo: DrawingInfo = parsedObj.getDrawingInfo();
          const rook: MeshModel = new MeshModel(this.gl, drawingInfo.vertices, drawingInfo.normals, drawingInfo.indices, 5);
          this.models.set(Model.Rook, rook);
          this.start();
        }).then(() => {
          fetch('assets/models/pawn_layout.obj')
            .then(response => response.text())
            .then(data => {
              const parsedObj: OBJDoc = new OBJDoc('pawn_layout.obj');
              parsedObj.parse(data, 1, true);
              const drawingInfo: DrawingInfo = parsedObj.getDrawingInfo();
              const pawn: MeshModel = new MeshModel(this.gl, drawingInfo.vertices, drawingInfo.normals, drawingInfo.indices, 5);
              this.models.set(Model.Pawn, pawn);
              this.start();
            });
        }).then(() => {
          fetch('assets/models/bishop_layout.obj')
            .then(response => response.text())
            .then(data => {
              const parsedObj: OBJDoc = new OBJDoc('bishop_layout.obj');
              parsedObj.parse(data, 1, true);
              const drawingInfo: DrawingInfo = parsedObj.getDrawingInfo();
              const bishop: MeshModel = new MeshModel(this.gl, drawingInfo.vertices, drawingInfo.normals, drawingInfo.indices, 5);
              this.models.set(Model.Bishop, bishop);
              this.start();
            });
        }).then(() => {
          fetch('assets/models/king_layout.obj')
            .then(response => response.text())
            .then(data => {
              const parsedObj: OBJDoc = new OBJDoc('king_layout.obj');
              parsedObj.parse(data, 1, true);
              const drawingInfo: DrawingInfo = parsedObj.getDrawingInfo();
              const king: MeshModel = new MeshModel(this.gl, drawingInfo.vertices, drawingInfo.normals, drawingInfo.indices, 5);
              this.models.set(Model.King, king);
              this.start();
            });
        }).then(() => {
          fetch('assets/models/queen_layout.obj')
            .then(response => response.text())
            .then(data => {
              const parsedObj: OBJDoc = new OBJDoc('queen_layout.obj');
              parsedObj.parse(data, 1, true);
              const drawingInfo: DrawingInfo = parsedObj.getDrawingInfo();
              const queen: MeshModel = new MeshModel(this.gl, drawingInfo.vertices, drawingInfo.normals, drawingInfo.indices, 5);
              this.models.set(Model.Queen, queen);
              this.start();
            });
        }).then(() => {
          fetch('assets/models/knight_layout.obj')
            .then(response => response.text())
            .then(data => {
              const parsedObj: OBJDoc = new OBJDoc('knight_layout.obj');
              parsedObj.parse(data, 1, true);
              const drawingInfo: DrawingInfo = parsedObj.getDrawingInfo();
              const cube: MeshModel = new MeshModel(this.gl, drawingInfo.vertices, drawingInfo.normals, drawingInfo.indices, 5);
              this.models.set(Model.Knight, cube);
              this.start();
            });
        }).then(() => {
          fetch('assets/models/square_layout.obj')
            .then(response => response.text())
            .then(data => {
              const parsedObj: OBJDoc = new OBJDoc('square_layout.obj');
              parsedObj.parse(data, 1, true);
              const drawingInfo: DrawingInfo = parsedObj.getDrawingInfo();
              const square: MeshModel = new MeshModel(this.gl, drawingInfo.vertices, drawingInfo.normals, drawingInfo.indices, 5);
              this.models.set(Model.Square, square);
              this.start();
            });
        }).then(() => {
          fetch('assets/models/frame.obj')
            .then(response => response.text())
            .then(data => {
              const parsedObj: OBJDoc = new OBJDoc('frame.obj');
              parsedObj.parse(data, 1, true);
              const drawingInfo: DrawingInfo = parsedObj.getDrawingInfo();
              const frame: MeshModel = new MeshModel(this.gl, drawingInfo.vertices, drawingInfo.normals, drawingInfo.indices, 5);
              this.models.set(Model.Frame, frame);
              this.start();
            });
        });
    }
  }

  private draw(rank: number, file: BoardFile, color: Color, model: Model): void {
    this.gl.drawElements(this.gl.TRIANGLES, this.implementation.loadGLData(this.gl, rank, file, color, model), this.gl.UNSIGNED_SHORT, 0);
  }

  private drawSetup(data: string) {
    if (!data) {
      data =
        'wPa2,wPb2,wPc2,wPd2,wPe2,wPf2,wPg2,wPh2,bPa7,bPb7,bPc7,bPd7,bPe7,bPf7,bPg7,bPh7,' +
        'wRa1,wRh1,bRa8,bRh8,' +
        'wNb1,wNg1,bNb8,bNg8,' +
        'wBc1,wBf1,bBc8,bBf8,' +
        'wQd1,wKe1,bQd8,bKe8';
    }
    let puzzleData: Array<string> = [];
    if (data) {
      puzzleData = data.split(',');
    }
    const dataParsed = puzzleData.map((m) => parseSquareString(m));
    dataParsed.forEach(d => {
      this.draw(d.square.rank, d.square.file, d.unit.color, d.unit.unit);
    });
  }
  // Set up data in WebGL context, call drawArrays/drawElements
  public start(): void {
    console.log('Start');
    const gl = this.gl;
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    this.implementation.scaleCanvas();

    if (this.viewpoint === BoardView.Black) {
      this.handler.setBlack();
    }

    let location = window.location.toString();
    if (location.indexOf('view=') === -1) {
      location = location + '&view=w';
    }
    window.history.replaceState(null, 'Chess Puzzles', location);

    const pawn = this.models.get(Model.Pawn);
    const rook = this.models.get(Model.Rook);
    const bishop = this.models.get(Model.Bishop);
    const knight = this.models.get(Model.Knight);
    const square = this.models.get(Model.Square);
    const queen = this.models.get(Model.Queen);
    const king = this.models.get(Model.King);
    const frame = this.models.get(Model.Frame);
    if (pawn && rook && knight && bishop && queen && king  && square && frame) {
      gl.clearColor(0.0, 0.0, 0.0, 0.0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BIT);
      square.activate();
      for (let rank = 1; rank < 9; rank++) {
        for (let file: BoardFile = BoardFile.a; file <= BoardFile.h; file++) {
          const oddRank = ((rank % 2) === 1);
          const oddFile = ((file.valueOf() % 2) === 1);
          const color = ((oddRank && oddFile) || (!oddRank && !oddFile)) ? Color.Dark : Color.Light;
          gl.drawElements(gl.TRIANGLES, this.implementation.loadGLData(gl, rank, file, color, Model.Square), gl.UNSIGNED_SHORT, 0);
        }
      }
      frame.activate();
      gl.drawElements(gl.TRIANGLES,  this.implementation.loadGLData(gl, 1, BoardFile.a, Color.Frame, Model.Frame), gl.UNSIGNED_SHORT, 0);


      this.drawSetup(this.data);

    }
    else {
      console.log('Not all models loaded yet, please retry.');
    }
  }
}

