const { execFile  } = require('child_process')

console.log(process.platform)

var file = 'H:\\projects\\Hexo\\deploy.sh'
var options = {
    cwd: "H:\\projects\\Hexo"
}
var cb = (error, stdout, stderr) => {
    console.log('error = ', error)
    console.log('stdout = ', stdout)
    console.log('stderr = ', stderr)
}

execFile(file, [], options, cb)