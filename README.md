# g.js

`g` helps build gpu arrays and functions. 

It's like a mini `gpu.js` or `turbo.js`.  

Array:      webgl2 texture
Function:   glsl shader code

<pre>

<script src='g.js'> </script>

<script>
  
let A = g.Array(100,100)
let F = g.Function(['x'], 'y', 'y = texelFetch(x, tc, 0);')

F.run(A, 'canvas')

</script>

</pre>
