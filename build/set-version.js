const fs = require('fs')
const newVersion = process.argv[2]
const files = [
  'package.json',
  'src/manifest.json',
  'dist/manifest.json',
  'src/chromeapp/manifest.json'
]

function setReportVersion (csp) {
  return csp.replace(/\/v\d[\d_]+\d\//, '/v' + newVersion.replace(/\./g, '_') + '/')
}

function processCsp (json) {
  const cspObj = json.content_security_policy
  if (typeof cspObj === 'object') {
    Object.keys(cspObj).forEach(function (key) {
      cspObj[key] = setReportVersion(cspObj[key])
    })
  } else if (typeof cspObj === 'string') {
    json.content_security_policy = setReportVersion(cspObj)
  }
}

files.forEach((file) => {
  fs.readFile(file, 'utf8', function (err, content) {
    if (err || !content) return
    const parsedJson = JSON.parse(content)
    parsedJson.version = newVersion
    processCsp(parsedJson)
    fs.writeFile(file, JSON.stringify(parsedJson, null, '  '), 'utf8', function (err) {
      if (err) throw err
    })
  })
})
