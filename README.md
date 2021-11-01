# g.js
a couple scripts trying to write a script like turbo.js.

g.Array    = abstraction of webgl2 textures
g.Function = abstraction of fragment shader

<b>g.Array()</b> makes `array` with data in webgl2 texture

<b>g.Function()</b> makes `fun` with compiled glsl program and `run` method

<h4> Mini usage example </h4> 
<pre>
let A = g.Array(50,50, 'random')
let F = g.Function(['x'],'y', 'y = texture(x, uv); y.a = 1.0;')
    
F.run([A], 'canvas')
</pre>

<h4> Explanation </h4>
running a script with src='g.js' will create `g` object
