/* eslint-disable no-console,@typescript-eslint/no-var-requires */

const AWS = require('aws-sdk')
const deepmerge = require('deepmerge')
const fs = require('fs')
const moment = require('moment')
const path = require('path')
const request = require('node-fetch')
const s3StreamFactory = require('s3-upload-stream')
const { getConfig } = require('../utils')

const deployEnvironment = process.argv[2]

let deployConfig = getConfig('deploy')
if (deployEnvironment) {
  console.log('')
  console.log(`🥷  deploying to ${deployEnvironment}`)

  if (deployConfig[deployEnvironment]) {
    deployConfig = deepmerge(deployConfig, deployConfig[deployEnvironment])
  } else {
    console.log('')
    console.error(`⛑  Deploy environment ${deployEnvironment} not found in config.`)
    process.exit(1)
  }
}

const buildConfig = getConfig('build')

const fileExistenceBaseURL = deployConfig.aws.publicBaseURL
const MINIMUM_FILES_TO_UPLOAD = deployConfig.files.minimumFilesToUpload
const regExpFilesToAvoid = deployConfig.files.avoid.map((file) => new RegExp(file))
const regExpFilesToForce = deployConfig.files.force.map((file) => new RegExp(file))

const awsS3Config = {
  accessKeyId: deployConfig.aws.s3.accessKeyId || deployConfig.aws.accessKeyId,
  secretAccessKey: deployConfig.aws.s3.secretAccessKey || deployConfig.aws.secretAccessKey,
  region: deployConfig.aws.s3.region || deployConfig.aws.region,
  ACL: deployConfig.aws.s3.acl,
}
const s3Stream = s3StreamFactory(new AWS.S3(awsS3Config))
const publicDirectory = path.join(__dirname, '../../dist', buildConfig.outputPath)
const workingDirectory = path.join(publicDirectory, buildConfig.outputPathDeploy)
const s3bucketConfig = { Bucket: deployConfig.aws.s3.bucket }

const globalMetaTags = {
  CacheControl: 'max-age=315360000, no-transform, public',
  Expires: moment().utc().add(20, 'years').unix(),
}
const noCacheMetaTags = {
  CacheControl: 'no-cache, max-age=0, must-revalidate',
  Expires: moment().utc().add(-20, 'years').unix(),
}
const jsMetaTags = {
  ContentType: 'application/javascript',
  ...globalMetaTags,
}
const jsonMetaTags = {
  ContentType: 'application/json',
  ...globalMetaTags,
}
const cssMetaTags = {
  ContentType: 'text/css',
  ...globalMetaTags,
}
const htmlMetaTags = {
  ContentType: 'text/html; charset=UTF-8',
  ...globalMetaTags,
}
const txtMetaTags = {
  ContentType: 'text/plain; charset=UTF-8',
  ...globalMetaTags,
}

const readDirectory = (directory) => {
  const files = []
  fs.readdirSync(directory).forEach((file) => {
    const fullPath = path.resolve(directory, file)
    if (fs.statSync(fullPath).isDirectory()) {
      files.push(...readDirectory(fullPath))
    }
    files.push(fullPath)
  })
  return files
}

const filteredFiles = []
const fileExists = (file) =>
  request(`${fileExistenceBaseURL.replace(/\/$/, '')}/${file.replace(publicDirectory, '').replace(/^\//, '')}`, {
    method: 'GET',
  })
    .then((response) => {
      if (
        !deployConfig.files.smartUpload
        || !response.headers.get('x-cache')
        || !!response.headers.get('x-cache').match(/Error/g)
        || (+response.headers.get('content-length') && +response.headers.get('content-length') !== fs.statSync(file).size)
      ) {
        filteredFiles.push(file)
      }
    })
    .catch((e) => {
      console.log([e.message, file, `${fileExistenceBaseURL}${file.replace(publicDirectory, '')}`])
    })

const getTasksFromFilteredFiles = (files) => {
  const filterTasks = []
  files.forEach((file) => {
    const stats = fs.statSync(file)
    if (stats.isDirectory()) {
      return
    }
    for (let c = 0; c < regExpFilesToForce.length; c += 1) {
      if (file.match(regExpFilesToForce[c])) {
        filteredFiles.push(file)
        return
      }
    }
    for (let c = 0; c < regExpFilesToAvoid.length; c += 1) {
      if (file.match(regExpFilesToAvoid[c])) {
        console.log(`⚠️  Excluded ${file}`)
        return
      }
    }
    if (stats.size <= 0) {
      console.log('')
      console.log('  🚨 👎 0 bytes file, correct it or remove it please:')
      console.log(`     "${file}".\n`)
      return
    }
    filterTasks.push(fileExists(file))
  })
  return filterTasks
}

const uploadFile = (directory, filename, extraConfig = {}) =>
  new Promise((resolve, reject) => {
    const config = {
      Key: `${deployConfig.aws.s3.path}${filename.replace(/\\/g, '/').substring(directory.length + 1)}`
        .replace(/[/]{2,}/g, '/')
        .replace(/^\//, ''),
      ...extraConfig,
    }

    // Create the streams
    const upload = s3Stream.upload(config)

    // Optional configuration
    upload.maxPartSize(20971520) // 20 MB
    upload.concurrentParts(5)

    // Handle errors.
    upload.on('error', (error) => {
      console.error(error)
      reject(error)
    })

    /* Handle upload completion. Example details object:
   { Location: 'https://bucketName.s3.amazonaws.com/filename.ext',
   Bucket: 'bucketName',
   Key: 'filename.ext',
   ETag: '"bf2acbedf84207d696c8da7dbb205b9f-5"' }
   */
    upload.on('uploaded', (details) => {
      console.log(`✅  ${details.Key} was successfully uploaded!`)
      resolve()
    })

    const readStream = fs.createReadStream(filename)
    readStream.pipe(upload)
  })

const getTasksFromFiles = (files) => {
  const tasks = []
  files.forEach((file) => {
    // uploaded by file type to allow for special tag appending
    // gzipped files
    if (/\.(css)$/.test(file)) {
      tasks.push(uploadFile(workingDirectory, file, { ...s3bucketConfig, ...cssMetaTags }))
    } else if (/sw\.js$/.test(file)) {
      tasks.push(
        uploadFile(workingDirectory, file, {
          ...s3bucketConfig,
          ...jsMetaTags,
          ...noCacheMetaTags,
        }),
      )
    } else if (/scripts\.txt$/.test(file)) {
      tasks.push(
        uploadFile(workingDirectory, file, {
          ...s3bucketConfig,
          ...txtMetaTags,
          ...noCacheMetaTags,
        }),
      )
    } else if (/\.(js)$/.test(file)) {
      tasks.push(
        uploadFile(workingDirectory, file, {
          ...s3bucketConfig,
          ...jsMetaTags,
        }),
      )
    } else if (/\.(json)$/.test(file)) {
      tasks.push(
        uploadFile(workingDirectory, file, {
          ...s3bucketConfig,
          ...jsonMetaTags,
        }),
      )
    } else if (/\.(html)$/.test(file)) {
      tasks.push(uploadFile(workingDirectory, file, { ...s3bucketConfig, ...htmlMetaTags }))
    } else if (/\.(map)$/.test(file)) {
      tasks.push(uploadFile(workingDirectory, file, { ...s3bucketConfig, ...jsMetaTags }))
    } else {
      tasks.push(uploadFile(workingDirectory, file, { ...s3bucketConfig, ...globalMetaTags }))
    }
  })
  return tasks
}

const postDeploy = () => {
  console.log('\n🎉 🎊 All done! Have a great day. 😎🍺\n')
}

const processAllTasks = (tasks) => {
  const publicBasePath = `/${fileExistenceBaseURL.replace('://', '').split('/').slice(1).join('/')}`.replace(
    /[/]+$/,
    '',
  )
  Promise.all(tasks)
    .then(() => {
      console.log('\n✅  All uploads successfully completed! 🏋')
      const invalidates = filteredFiles.map((file) => file.replace(publicDirectory, publicBasePath).replace(/\\/g, '/'))

      console.log(`\n🔥  Invalidating... ${invalidates.join(' ')}`)
      const cloudfront = new AWS.CloudFront()

      cloudfront.config.update({
        accessKeyId: deployConfig.aws.cloudFront.accessKeyId || deployConfig.aws.accessKeyId,
        secretAccessKey: deployConfig.aws.cloudFront.secretAccessKey || deployConfig.aws.secretAccessKey,
        region: deployConfig.aws.cloudFront.region || deployConfig.aws.region,
      })

      cloudfront.createInvalidation(
        {
          DistributionId: deployConfig.aws.cloudFront.distributionId,
          InvalidationBatch: {
            CallerReference: Date.now().toString(),
            Paths: {
              Quantity: invalidates.length,
              Items: invalidates,
            },
          },
        },
        (err) => {
          if (err) {
            return console.log(['🚨 👎  Could not invalidate cloudfront 👴  \n', err])
          }

          console.log('🌞  Invalidated! Getting all new.')
          postDeploy()
          return null
        },
      )
    })
    .catch((errors) => errors.forEach((error) => console.error(error)))
}

const filesList = readDirectory(workingDirectory)
console.log('')
console.log(`🕵  ${filesList.length} files found`)
console.log('  🧙 Filtering files to upload...')

const filterTasksList = getTasksFromFilteredFiles(filesList)
console.log(`  👨‍💻 Looking into ${filterTasksList.length} files ...`)

Promise.all(filterTasksList)
  .then(() => {
    console.log(`  👷 ${filteredFiles.length} files to work on\n`)
    if (filteredFiles.length >= MINIMUM_FILES_TO_UPLOAD) {
      const tasksList = getTasksFromFiles(filteredFiles)
      processAllTasks(tasksList)
    } else {
      console.log(`  🤷 Minimum files to work (${MINIMUM_FILES_TO_UPLOAD}) not reached\n`)
    }
  })
  .catch((err) => {
    console.log(err)
    console.log('🚨 ☠ ☣ unable to process files\n')
  })
