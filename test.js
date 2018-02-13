const pug = require('pug')

// Compile the source code
const compiledFunction = pug.compileFile(__dirname + '/views/dashboard.pug');

// Render a set of data
console.log(compiledFunction());