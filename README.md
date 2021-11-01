some attempts at making a mini turbo.js or gpu.js <br>
<pre>
g.Array    = abstraction of webgl2 textures
g.Function = abstraction of fragment shader
</pre>
<h4> example </h4> 
<pre>
let A = g.Array(50,50, 'random')
let F = g.Function(['x'],'y', 'y = texture(x, uv); y.a = 1.0;')
    
F.run([A], 'canvas')
</pre>
