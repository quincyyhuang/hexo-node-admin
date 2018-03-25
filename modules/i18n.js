const path = require('path')
const fs = require('fs')

// Settings
try {
    var config = JSON.parse(fs.readFileSync(path.join(__dirname, '../', 'config.json'), 'utf8'))
} catch (e) {
    console.log('Bad config file.')
    process.exit()
}

let lang = config.lang || 'en_US'
let loadedLanguage

module.exports = i18n

function i18n() {
    try {
        loadedLanguage = JSON.parse(fs.readFileSync(path.join(__dirname, '../', 'lang', lang + '.json'), 'utf8'))
    } catch(e) {
        console.log(`Language file ${lang} damaged.`)
        process.exit()
    }
}

i18n.prototype.__ = function(phrase) {
    let translation = loadedLanguage[phrase]
    if (translation === undefined) {
        translation = phrase
    }
    return translation
}