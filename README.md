# locreq

`locreq` is an answer to the problem of [requiring local paths in Node.js](https://gist.github.com/branneman/8048520). It allows you to easily require modules by specifying their paths relative to your project root, not relative to the file they're `require`d from.

Assume the following directory structure:

```
- lib
  - collectionA
	- moduleA1.js
	- moduleA2.js
  - collectionB
	- collectionB1
	  - moduleB1a.js
```

Now, to require module `A2.js` from module `B1a.js`, using regular `require`:

```javascript
require("../../collectionA/moduleA2.js");
```

There are a few problems with the above example:

* it has a high cognitive overhead;
* when you move the `B1a.js` file, you have to update the argument to `require`;
* it's hard to search for all files that require the `A2` module.

With `locreq`, it's easier:

```javascript
const locreq = require("locreq")(__dirname);
locreq("lib/collectionA/moduleA2.js");
```

If you have lots of dependencies, `locreq` can really make a difference.

## Installation & usage

To install `locreq`, use:

```
npm install --save locreq
```

To use the module, require it like so:

```javascript
const locreq = require("locreq")(__dirname);
```

The `(__dirname);` part is very important, don't forget it!

Next, simply use `locreq` instead of `require` for your local modules, giving a path relative to the root of your package (that is, relative to the directory where the `package.json` of your project is):

```javascript
var moduleA = locreq("lib/my-modules/moduleA.js");
```

Similar to regular `require`, you can also use the `locreq.resolve` method:

```
const module_path = locreq.resolve("lib/my-modules/moduleA.js"); //returns the absolute path to the module
```

## How does it work?

1. `locreq` goes up the directory hierarchy, parent directory by parent directory
2. Once it finds a `package.json` it stops the search and treats the directory as the root directory of the package
3. It then performs a regular `require` on a path that's resolved from combining the package root directory and the path given as an argument, and then returns that.

## Advantages

* **it works even if your package is `require`d by a different package (which is not the case for the `require.main.require` trick)**;
* it doesn't mess with the global scope;
* it doesn't need changes in environment variables;
* it doesn't need any additional start-up scripts;
* it doesn't overwrite the default `require` behavior.
