# OneCommit
A cli tool to create new branches with just one commit

Sometimes you can neither create well organized branches nor rebase your code appropriately. 

For example, let's say that you have an error in production that is not replicable otherwhere. Most likely, you will create a lot of commits that you have to push in order to pull the changes where you are debugging your code.

When you finally discover the issue, you have probably done many changes but you have a bad history of commits that don't make sense. How to you clean your code?

OneCommit 
1. compares the differences between your current branch with master (or a different branch)
2. saves the changes in a working folder
3. checkouts master
4. copies back the files in the repo
5. if you specify one, checkouts -b a new branch

At this point, you can commit with a clear message and create a clean pull request with just one commit.

# Install

Use npm (or yarn):
```
npm i -g onecommit
```

# Usage

Move to the root of the repo and run onecommit. Optionally, you can specify the _master_ branch (if not `master`) and the new branch to be created with the changes (if you don't do, it will remain in the _master_ branch). 

## Examples

Use `master` and stay in `master` after the restore:
```
onecommit
```

Use `develop` and create the new branch `version2` after the restore:
```
onecommit -d develop -n version2
```

Commits the current changes before proceeding if not committed yet:
```
onecommit -c
```

In general, execute `onecommit -h` to get an help.


# Next steps (maybe)

- Refactoring it to make it easily expandeable.
- Adding a test unit.

# Licence 

[MIT](https://opensource.org/licenses/MIT)

# Copyright

2019, [Francesco Sullo](https://francesco.sullo.co)
 
### Enjoy and let me know what do you think :o)
