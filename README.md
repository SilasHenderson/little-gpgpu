# g.js
<hr>
some attempts at writing a gpgpu engine like turbo.js <br>
name from gpu.js two letters shorter --> g.js

g.Array    = abstraction of webgl2 textures <br>
g.Function = abstraction of fragment shader <br>

<h4> example </h4> 
<pre>
let A = g.Array(50,50, 'random')
let F = g.Function(['x'],'y', 'y = texture(x, uv); y.a = 1.0;')
    
F.run([A], 'canvas')
</pre>
