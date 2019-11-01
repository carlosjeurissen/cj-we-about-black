const Promise = require('bluebird')
const fs = require('fs-extra')
const minimist = require('minimist')
const chromeUpload = require('./modules/chrome-upload.js')
const targetDir = 'dist_packed'
const archiver = require('archiver')

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir)
}

const optionsConfig = {
  'string': ['variant'],
  'boolean': ['packonly'],
  'default': {
    'packonly': false,
    'variant': 'main'
  }
}

const buildData = JSON.parse(fs.readFileSync('./build/build-data.json'))

const taskOptions = minimist(process.argv.slice(2), optionsConfig)
const packOnly = taskOptions.packonly

let variant = taskOptions.variant

let variantData = (buildData.variants && buildData.variants[variant]) || buildData.default_variant

let extensionUUID = variantData.chrome_store_id

let versionNumber = process.env.npm_package_version

let packageNamePrefix = targetDir + '/' + buildData.short_id + '-v' + versionNumber + '-' + variant

let zipPathName = packageNamePrefix + '.zip'
let sourceZipPathName = packageNamePrefix + '-source.zip'

function createZipFile (options) {
  return new Promise(function (resolve, reject) {
    let outStream = fs.createWriteStream(options.outputName)
    let archive = archiver('zip', {
      'gzip': true,
      'gzipOptions': {
        'level': 9
      }
    })
    outStream.on('close', resolve)
    archive.on('error', reject)
    archive.pipe(outStream)
    if (Array.isArray(options.globs)) {
      options.globs.forEach(function (glob) {
        console.log(glob)
        archive.glob(glob)
      })
    }
    if (options.dir) {
      archive.directory(options.dir, false)
    }
    archive.finalize()
  })
}

function chromePublish () {
  return chromeUpload({
    'extensionId': extensionUUID,
    'credentialsPath': process.env.HOME + '/.chromepublishcredentials',
    'zipPath': zipPathName
  })
}

function packDist () {
  return createZipFile({
    'outputName': zipPathName,
    'dir': 'dist'
  })
}

function packSource () {
  return createZipFile({
    'outputName': sourceZipPathName,
    'globs': ['gulpfile.js', 'README.md', 'package.json', 'yarn.lock', 'src/**', 'build/**']
  })
}

function publish () {
  var mainZipPackage = packDist().then(function () { console.log(arguments) }, function () { console.log(arguments) })
  if (packOnly) return
  if (extensionUUID) {
    mainZipPackage.then(chromePublish)
  }
  packSource()
}

publish()
