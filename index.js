const fs = require('fs-extra')
const path = require('path')
const homedir = require('homedir')
const {execSync, spawn} = require('child_process')
const {version} = require('./package')

const program = require('commander')
program
    .version(version)
    .option('-d, --destination [master branch]', 'the destination branch if not master')
    .option('-n, --new-branch [new branch]', 'the new branch where to put the changes')
    .parse(process.argv)

const dest = program.destination || 'master'

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

let errors = {
  notARepo: 'The current folder does not look like it is in a git repo',
  notClean: 'The repo has changes that must be committed before running gitase',
  notOn: `You cannot run OneCommit on `
}

try {

  let branch = exec('git rev-parse --abbrev-ref HEAD')[0]
  if (branch.split(' ').length !== 1) {
    throw new Error(errors.notARepo)
  }
  let status = exec('git status -s')[0]
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

  let pwd = exec('pwd')[0]
  const workingDir = path.join(homedir(),'.gitase', pwd.replace(/\//g,'__'))
  fs.emptyDirSync(workingDir)

  for (let file of diff) {
    exec(`cp ${pwd}/${file} ${workingDir}/${file.replace(/\//g,'__')}`)
  }

  exec('git checkout master')

  for (let file of diff) {
    fs.ensureDirSync(path.dirname(`${pwd}/${file}`))
    exec(`cp ${workingDir}/${file.replace(/\//g,'__')} ${pwd}/${file}`)
  }

  if (program.newBranch) {
    exec(`git checkout -b ${program.newBranch}`)
  }

  fs.emptyDirSync(workingDir)

} catch (e) {
  console.error(e.message)
  process.exit()
}


