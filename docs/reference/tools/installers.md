# Getting the source code

```

```

# Configure the environment

# Installing dependencies

## Node dependencies

Some dependencies are required by the build system (Grunt) and by
the additional tools of the project. All of them are defined within
the file `package.json` at the root of the project.

To install them, we simply need to use NPM (the package manager from Node)
with the parameter `install`, as shown below:

```
$ npm install
```

## Web dependencies

Some dependencies are required for the Web application itself.
Some dependencies are required by the Web application itself. All of them
are defined within the file `bower.json` at the root of the project.

To install them, we simply need to use Bower (the package manager from Web)
with the parameter `install`, as shown below:

```
$ bower install
```

# Build the application

```
$ grunt build
```

# Install on target platform

## APISpark platform

Use dedicated installer