# scaffoldify

Declarative and reusable scaffolding framework. with scaffoldify configuration API, you can use JSON to describe the scaffolding process.  


# Table of Contents

-   [Installation](#Installation)
-   [Usage](#Usage)
-   [Configuration](#Configuration)
    -   [cwd](#cwd)
    -   [options](#options)
    -   [transform](#transform)
    -   [templates](#templates)
    -   [inquiries](#inquiries)
    -   [mappers](#mappers)
        -   [from](#from)
        -   [to](#to)
        -   [overwrite](#overwrite)
-   [Template](#Template)
-   [Node API](#node-api)

# Installation 

```bash
npm install -g scaffoldify@latest
```

# Usage

```bash
scaffoldify --help
```

# Configuration

Configuration can either be a JSON file or CJS module that returns a JSON. when you run the scaffoldify command line and config option `--config` is not provided, 
it will lookup `scaffoldify.config.js` or `.scaffoldifyrc` file in current and user home directory.

```js
const path = require('path');
const fs = require('fs');
module.exports = {
    cwd: '/path/to/your/working/directory',
    options: {},
    transform: value => value,
    templates: '/path/to/your/templates/folder',
    inquiries: [
        {
            type: 'input',
            name: 'projectName',
            message: 'Enter name for your react project:',
            default: 'my-react-project',
            validate: input => {
                if(!/^([a-z_-]+)+$/.test(input)) {
                    return 'only lower case characters allowed';
                }
                return true;
            },
        },
    ],
    mappers: [
        { from: 'index.js.tmpl', to: '[projectName]/src/index.js', overwrite: false},
        { from: 'index.test.js.tmpl',to: answers => `${answers.projectName}/src/__test__/index.js`},
        'package.json.tmpl => [projectName]/package.json?overwrite=false',
    ]
}
```

## cwd

Currently working directory on based of which the template will be copied to. `process.cwd()` will be used if not specified.

## options

initial config hashes passed along with inquiry answers to scaffoldify tool. A default empty object `{}` will be used if omitted.

## transform

A custom function used to transform hashes before passing to scaffoldify tool. A default identify function `value => value` will be used if omitted.

## templates

Location where the templates are defined.

## inquiries

List of object to get user's inputs. It's based on [Inquirer](https://github.com/SBoudrias/Inquirer.js/#prompt-types).

## mappers

List of mapper which tells scaffoldify where to place template. the mapper definition takes two forms (object or string). If a mapper is not defined for the template,
a default mapper `path/to/your/template.ext.tmpl => path/to/your/template.ext` will used.

### from

path to your template file

### to

the new location where your template will be placed. you can also use variables enclosed with brackets that will be resolved with
hashes passed in. e.g `[ui]/index.js` will be resolved to `ui/src/index.js` given the hashes `{ui: 'ui/src'}`

### overwrite

tell if you want to overwrite a file if it existed, a default value true will be used if omitted. if the mapper definition is string, a query 
parameter can be used to specify overwrite flag. below two mapper definitions are equivalent. 
```
index.js.tmpl => [ui]/index.js?overwrite=false

{from: 'index.js.tmpl', to: '[ui]/index.js', overwrite: false}
```

# Template

The template definition follows the syntax of [Lodash template](https://lodash.com/docs/4.17.15#template)

# <a name="node-api"></a>Node API


```js
const scaffoldify = require('scaffoldify');
const config = {
    ...
}
scaffoldify(config)
```