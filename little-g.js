/* ~ little g: gpu Functions and Arrays ~ */

/*

little-g.js makes javascript object called 'g'

g.Array()      = make gpu array
g.Function()   = make gpu kernel
g.canvas       = html canvas element
g.gl           = webgl2 instance 
g.array_count  = count calls to g.Array()

*/

let g = {};

g.canvas      = document.createElement('canvas');
g.gl          = g.canvas.getContext('webgl2');
g.array_count = 0;

g.gl.getExtension("EXT_color_buffer_float");
g.gl.bindBuffer(g.gl.ARRAY_BUFFER, g.gl.createBuffer());
g.gl.bufferData(g.gl.ARRAY_BUFFER, 
    new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), g.gl.STATIC_DRAW);

g.canvas.width  = 500;
g.canvas.height = 500;

/* -------------------- Array Generator ------------------ */

g.Array = (width,height) => {
	
    /* - Make new 'array' - */

    let array = {}

    array.width       = width
    array.height      = height 
    array.index       = 0
    array.unit        = [ 2*g.array_count,          2*g.array_count + 1     ]
    array.texture     = [ g.gl.createTexture(),     g.gl.createTexture()    ]
    array.framebuffer = [ g.gl.createFramebuffer(), g.gl.createFramebuffer()] 

    /* - Init textures and framebuffers - */

    g.array_count += 1;

    for (let i of [0,1]) { 	

        g.gl.activeTexture( g.gl.TEXTURE0 +  array.unit[i]);
        g.gl.bindTexture(   g.gl.TEXTURE_2D, array.texture[i]);
        g.gl.texParameterf( g.gl.TEXTURE_2D, g.gl.TEXTURE_MIN_FILTER, g.gl.NEAREST);
        g.gl.texParameterf( g.gl.TEXTURE_2D, g.gl.TEXTURE_MAG_FILTER, g.gl.NEAREST);
        g.gl.texParameterf( g.gl.TEXTURE_2D, g.gl.TEXTURE_WRAP_S,     g.gl.CLAMP_TO_EDGE);
        g.gl.texParameterf( g.gl.TEXTURE_2D, g.gl.TEXTURE_WRAP_T,     g.gl.CLAMP_TO_EDGE); 
        
        g.gl.texImage2D(   g.gl.TEXTURE_2D, 0, g.gl.RGBA32F, width,height,
             0, g.gl.RGBA, g.gl.FLOAT, new Float32Array(4*width*height) );
 
        g.gl.bindFramebuffer(      g.gl.FRAMEBUFFER, array.framebuffer[i]);
        g.gl.framebufferTexture2D( g.gl.FRAMEBUFFER, g.gl.COLOR_ATTACHMENT0, g.gl.TEXTURE_2D, array.texture[i], 0); 
    }

    /* - Get, Set methods - */

    array.set = (x,y,w,h, data) => {

        g.gl.activeTexture( g.gl.TEXTURE0 +  array.unit[    array.index]);
        g.gl.bindTexture(   g.gl.TEXTURE_2D, array.texture[ array.index]);
        g.gl.texSubImage2D( g.gl.TEXTURE_2D, 0, x,y,w,h, g.gl.RGBA, g.gl.FLOAT, data ); 
    }

    array.get = (x,y,w,h) => {

    	let data = new Float32Array(4*w*h);

        g.gl.activeTexture(g.gl.TEXTURE0 +  array.unit[    array.index]);
        g.gl.bindTexture(  g.gl.TEXTURE_2D, array.texture[ array.index]);
        g.gl.readPixels( x,y,w,h, g.gl.RGBA, g.gl.FLOAT, data);
        
        return data; 
    } 

    return array;
}

/*--------------------- Function Generator ---------------------- */

g.Function = (in_names, out_name, code) => { 

    /* - Make new 'fun' - */

    let fun = {};

    fun.program  = g.gl.createProgram();
    fun.samplers = [];

    /* - Vertex and fragment shader text - */

    let samp = '';
    for (let name of in_names) { 
   	samp += `\nuniform sampler2D ${name};\n`
    }

    let vertex_code =

      	`layout(location=0) in vec2 xy;
        out vec2 uv; 

        void main() {
            uv = .5 + .5*xy;
            gl_Position = vec4(xy, 0.,1.);
        }`;

    let fragment_code = 

        `in vec2 uv;
        out vec4 ${out_name};
        ${samp}        
        void main() {
            ivec2 tc = ivec2(gl_FragCoord.xy);
            ${code}
        }`;

    /* - Make shaders, compile, build glsl shader program - */

    let vertex_shader   = g.gl.createShader(g.gl.VERTEX_SHADER);
    let fragment_shader = g.gl.createShader(g.gl.FRAGMENT_SHADER);
    let header          = '#version 300 es\n precision highp float;'

    g.gl.shaderSource(  vertex_shader,   header + vertex_code);
    g.gl.shaderSource(  fragment_shader, header + fragment_code);
    g.gl.compileShader( vertex_shader);                               
    g.gl.compileShader( fragment_shader);
    g.gl.attachShader(  fun.program, vertex_shader);
    g.gl.attachShader(  fun.program, fragment_shader);
    g.gl.linkProgram(   fun.program);     
    g.gl.useProgram(    fun.program);     

    /* - Vertices from buffer 0 - */

    g.gl.enableVertexAttribArray(0);
    g.gl.vertexAttribPointer(0, 2, g.gl.FLOAT, false, 0, 0);   
   
    /* - Uniform Sampler pointers - */

    for (let name of in_names) {
        let u_loc = g.gl.getUniformLocation( fun.program, name);  
        fun.samplers.push( u_loc);  	
    }

    /* - Define fun.run() - */
    
    fun.run = (arrays_in, array_out) => {
    
	g.gl.useProgram( fun.program);

        for (let i = 0; i < arrays_in.length; i++) { 
            g.gl.uniform1i( 
                fun.samplers[i], 
           	arrays_in[i].unit[ arrays_in[i].index ]); 
      	}

        if (array_out == "canvas") { 
            g.gl.bindFramebuffer( g.gl.FRAMEBUFFER, null); 
            g.gl.viewport(0,0, g.canvas.width, g.canvas.height); 
        } 
        else { 
            array_out.index = 1 - array_out.index;
            g.gl.bindFramebuffer( g.gl.FRAMEBUFFER, array_out.framebuffer[array_out.index]); 
            g.gl.viewport( 0,0, array_out.width, array_out.height)
        }

       	g.gl.drawArrays(g.gl.TRIANGLE_STRIP, 0, 4); 
   }

   /* - Return fun - */

   return fun 
}
