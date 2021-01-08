# g.js

`g` helps build gpu arrays and functions.

<b>g.Array()</b> makes `array` with data in webgl2 texture

<b>g.Function()</b> makes `fun` with compiled glsl program and `run` method

<pre>
<!doctype html>

<script src='little-g.js'> </script>

<body>
<script>

document.body.appendChild(g.canvas)

let A = g.Array(50,50, 'random')

let F = g.Function( 
	['x'],'y', 'y = texture(x, uv); y.a = 1.0;'
)

F.run([A], 'canvas')

</script> 
</body>

</pre>

running a script with src='g.js' will create `g` object
