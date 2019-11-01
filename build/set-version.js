const fs = require('fs')
const version = process.argv[2]
const files = [
  'package.json',
  'src/manifest.json',
  'dist/manifest.json',
  'src/chromeapp/manifest.json'
]

files.forEach((file) => {
  fs.readFile(file, 'utf8', function (err, content) {
    if (err) return
    let parseJson = JSON.parse(content)
    parseJson.version = version
    fs.writeFile(file, JSON.stringify(parseJson, null, '  '), 'utf8', function (err) {
      if (err) throw err
    })
  })
})
