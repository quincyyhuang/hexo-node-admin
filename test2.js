const util = require('util')
const fs = require('fs')
const path = require('path')
const readdir = util.promisify(fs.readdir)
const mkdir = util.promisify(fs.mkdir)
const rename = util.promisify(fs.rename)
const stat = util.promisify(fs.stat)

const hexoRoot = "H:\\projects\\Hexo"
const hexoPostDir = path.join(hexoRoot, 'source', '_posts')

const name = 'H:\\projects\\Hexo\\source\\_posts\\hello-world\\upload_1d6bb9ea231a7342bddb372a00795e45.blockmap'
const name2 = 'H:\\projects\\Hexo\\source\\_posts\\hello-world\\upload_929fa7c74bf0b069add49f450fe8eb56.blockmap'
const name3 = 'H:\\projects\\Hexo\\source\\_posts\\hello-world\\aaaaa.cc'

async function go() {
	try {
		await rename(name3, path.join(path.dirname(name3), 'a.blockmap'))
	} catch(e) {
		console.log(e)
	}
}

go()