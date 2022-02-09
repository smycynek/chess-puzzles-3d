// Adjusted for Typescript

// Adapted from cuon-utils.js (c) 2012 kanda and matsuda

export class GlUtil {
  public static initShaders(gl: any, vshader: string, fshader: string): boolean {
    const program = GlUtil.createProgram(gl, vshader, fshader);
    if (!program) {
      console.log('Failed to create program');
      return false;
    }
    gl.useProgram(program);
    gl.program = program;
    return true;
  }

  public static initArrayBuffer(gl: any, attribute: string, data: Float32Array, num: number, type: any): any {
  // Create a buffer object
    const buffer = gl.createBuffer();
    if (!buffer) {
      console.log('Failed to create the buffer object');
      return false;
    }
    // Write date into the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    // Assign the buffer object to the attribute variable
    const a_attribute = gl.getAttribLocation(gl.program, attribute);

    const err = gl.getError();
    if (err !== 0) {
      console.log(`initArrayBuffer getAttribLocation() ${attribute} error: ${err}`);
    }

    if (a_attribute < 0) {
      console.log('Failed to get the storage location of ' + attribute);
      return false;
    }
    gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
    // Enable the assignment of the buffer object to the attribute variable
    gl.enableVertexAttribArray(a_attribute);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    return buffer;
  }

  /**
   * Create the linked program object
   * @param gl GL context
   * @param vshader a vertex shader program (string)
   * @param fshader a fragment shader program (string)
   * @return created program object, or null if the creation has failed
   */
  public static createProgram(gl: any, vshader: string, fshader: string) : any | null {
    // Create shader object
    const vertexShader = GlUtil.loadShader(gl, gl.VERTEX_SHADER, vshader);
    const fragmentShader = GlUtil.loadShader(gl, gl.FRAGMENT_SHADER, fshader);
    if (!vertexShader || !fragmentShader) {
      return null;
    }

    // Create a program object
    const program = gl.createProgram();
    if (!program) {
      return null;
    }

    // Attach the shader objects
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    // Link the program object
    gl.linkProgram(program);

    // Check the result of linking
    const linked = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!linked) {
      const error = gl.getProgramInfoLog(program);
      console.log('Failed to link program: ' + error);
      gl.deleteProgram(program);
      gl.deleteShader(fragmentShader);
      gl.deleteShader(vertexShader);
      return null;
    }
    return program;
  }

  /**
   * Create a shader object
   * @param gl GL context
   * @param type the type of the shader object to be created
   * @param source shader program (string)
   * @return created shader object, or null if the creation has failed.
   */
  private static loadShader(gl: any, type: any, source: string): any | null {
    // Create shader object
    const shader = gl.createShader(type);
    if (shader == null) {
      console.log('unable to create shader');
      return null;
    }

    // Set the shader program
    gl.shaderSource(shader, source);

    // Compile the shader
    gl.compileShader(shader);

    // Check the result of compilation
    const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!compiled) {
      const error = gl.getShaderInfoLog(shader);
      console.log('Failed to compile shader: ' + error);
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  }
}