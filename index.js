const fs = require('fs-extra')
const path = require('path')
const homedir = require('homedir')
const {execSync, spawn} = require('child_process')

const program = require('commander')
program
    .version('0.1.0')
    .option('-d, --destination-repo [destinationRepo]', 'The destination repo if not master')
    .parse(process.argv)

const dest = program.destinationRepo || 'master'

function exec(cmd) {
  try {
    return execSync(cmd).toString().replace(/\n$/, '').split('\n')
  } catch (err) {
    return []
  }
}

async function execAndShow(cmd, params) {
  return new Promise(resolve => {
    let result = ''
    const build = spawn(cmd, params)

    build.stdout.on('data', function (data) {
      result += data.toString()
      process.stdout.write(data.toString())
    })

    build.stderr.on('data', function (data) {
      process.stdout.write(data.toString())
    })

    build.on('exit', function () {
      resolve(result)
    })
  })
}

function getWorkingDir(repo) {
  // const workingDir = path.resolve('
}

let errors = {
  notARepo: 'The current folder does not look like it is in a git repo',
  notClean: 'The repo has changes that must be committed before running gitase',
  notOn: 'You cannot run gitase on '
}

try {

  let branch = exec('git rev-parse --abbrev-ref HEAD')[0]
  if (branch.split(' ').length !== 1) {
    throw new Error(errors.notARepo)
  }
  let status = exec('git status -s')
  if (status) {
    throw new Error(errors.notClean)
  }
  if (branch === dest) {
    throw new Error(errors.notOn + dest)
  }

  let diff = exec(`git diff ${dest} --name-only`)

  if (!diff.length) {
    throw new Error(`There are no differences between ${branch} and ${dest}`)
  }

  let pwd = exec('pwd')

  // let workingDir = getWorkingDir()

  console.log(pwd)


} catch (e) {
  console.error(e.message)
  process.exit()
}


