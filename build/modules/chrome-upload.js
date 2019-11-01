const fs = require('fs-extra')
const chromeWebstoreUpload = require('chrome-webstore-upload')

function runPublishScript (parameters) {
  let tokenData = JSON.parse(fs.readFileSync(parameters.credentialsPath))
  let myZipFile = fs.createReadStream(parameters.zipPath)

  let webStoreApi = chromeWebstoreUpload({
    'extensionId': parameters.extensionId,
    'clientId': tokenData.clientId,
    'clientSecret': tokenData.clientSecret,
    'refreshToken': tokenData.refreshToken
  })

  webStoreApi.fetchToken().then(accessToken => {
    return webStoreApi.uploadExisting(myZipFile, accessToken).then(res => {
      console.log(res)
      return webStoreApi.publish('default', accessToken).then(res => {
        console.log(res)
      })
    })
  }).catch(err => {
    console.log(err)
  })
}

exports.publish = runPublishScript
module.exports = exports['publish']
