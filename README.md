# scaffoldify

Scaffoldify is a tool to simplify `scaffold`. with its command line interface or Node API, you can scaffold pretty much anything with little or zero code. 


# Table of Contents

-   [Installation](#Installation)
-   [Usage](#Usage)
-   [Configuration](#Configuration)
    -   [cwd](#cwd)
    -   [templates](#templates)
    -   [inquiries](#inquiries)
    -   [mappers](#mappers)
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

Configuration can either be a JSON file `.scaffoldifyrc` or a JS file `scaffoldify.config.js` that returns a JSON

```js
const path = require('path');
const fs = require('fs');
module.exports = {
    cwd: '/path/to/your/working/directory',
    templates: '/path/to/your/templates/folder',
    inquiries: [
        {
            type: 'input',
            name: 'projectName',
            message: 'Please enter a name for your react project:',
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
        'package.json.tmpl => [projectName]/package.json',
        { from: 'index.js.tmpl', to: '[projectName]/src/index.js'},
        { from: 'index.test.js.tmpl',to: answers => `${answers.projectName}/src/__test__/index.js`}
    ]
}
```

## cwd

Currently working directory on based of which the template will be copied to. `process.cwd()` will be used if not specified.

## templates

Location where the templates are defined.

## inquiries

List of object to get user's inputs. It's based on [Inquirer](https://github.com/SBoudrias/Inquirer.js/#prompt-types).

## mappers

List of mapper which tells scaffoldify where to place the template. the mapper takes two forms (string or object). string form follows a specified a syntax `your/template => path/to/destination`.
the left part of `=>` is the template path and right part is the destination. You can put variables in brackets on the right part that will be replaced with user's input. 
assuming `/home` as `cwd` `package.json.tmpl => ui/package.json` will put `package.json.tmpl` to `/home/ui/package.json` after replacing all the placeholders in the template. refer to template section for more information. 
You can also use object to specify from and to similar to string form. to can also take customized function. 

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

```js
const CheckList = require("@webpack-cli/webpack-scaffold").CheckList;

CheckList("entry", "what kind of entry do you want?", ["Array", "Function"]);
```