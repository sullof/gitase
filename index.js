const fs = require('fs-extra')
const path = require('path')
const homedir = require('homedir')
const {execSync} = require('child_process')
const {version} = require('./package')
const program = require('commander')

program
    .version(version)
    .option('-d, --destination [master branch]', 'the destination branch if not master')
    .option('-n, --new-branch [new branch]', 'the new branch where to put the changes')
    .option('-c, --commit [message]', 'force commit of current branch')
    .parse(process.argv)

const dest = program.destination || 'master'

function exec(cmd) {
  try {
    return execSync(cmd).toString().replace(/\n$/, '').split('\n')
  } catch (err) {
    return []
  }
}

try {

  let branch = exec('git rev-parse --abbrev-ref HEAD')[0]
  if (branch.split(' ').length !== 1) {
    throw new Error('The current folder does not look like it is in a git repo')
  }
  let status = exec('git status -s')[0]
  if (status) {
    if (program.commit) {
      exec('git add -A')
      exec(`git commit -m "${program.commit === true ? `Random message #${Math.random().toString().substring(2)}` : program.commit}"`)
    } else {
      throw new Error('The repo has changes that must be committed before running onecommit')
    }
  }
  if (branch === dest) {
    throw new Error(`You cannot run onecommit on ${dest}`)
  }

  let diff = exec(`git diff ${dest} --name-only`)

  if (!diff.length) {
    throw new Error(`There are no differences between ${branch} and ${dest}`)
  }

  let pwd = exec('pwd')[0]
  const workingDir = path.join(homedir(), '.gitase', pwd.replace(/\//g, '__'))
  fs.emptyDirSync(workingDir)

  for (let file of diff) {
    exec(`cp ${pwd}/${file} ${workingDir}/${file.replace(/\//g, '__')}`)
  }

  exec('git checkout master')

  for (let file of diff) {
    fs.ensureDirSync(path.dirname(`${pwd}/${file}`))
    exec(`cp ${workingDir}/${file.replace(/\//g, '__')} ${pwd}/${file}`)
  }

  if (program.newBranch) {
    exec(`git checkout -b ${program.newBranch}`)
  }

  fs.emptyDirSync(workingDir)

} catch (e) {

  console.error(e.message)

}

process.exit(0)


