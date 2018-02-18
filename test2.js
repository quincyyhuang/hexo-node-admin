const util = require('util')
const fs = require('fs')
const path = require('path')
const readdir = util.promisify(fs.readdir)

const hexoRoot = "H:\\projects\\Hexo"
const hexoPostDir = path.join(hexoRoot, 'source', '_posts')

async function go() {
	try {
		var folder = path.join(hexoPostDir, 'hi')
		var assets = await readdir(folder)
	} catch(e) {
		console.log(e)
	}
	console.log(assets)
}

go()