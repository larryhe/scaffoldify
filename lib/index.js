'use strict';
const fs = require('fs');
const path = require('path');
const fsExt = require('fs-extra');
const compile = require('lodash/template');
const chalk = require('chalk');

/**
 * utility function to evaluate a template with context and return the result
 * @param template template definition following lodash template syntax https://lodash.com/docs/4.17.15#template
 * @param config the context
 */
function tmpl(template, config) {
    const fn = compile(template);
    return fn(config);
}

/**
 * evaluate the template from source directory with config as context and write the output into destination
 * @param src source template file
 * @param dest destination file
 * @param config template context object
 */
function copyTmpl(src, dest, config) {
    const content = fs.readFileSync(src, 'utf8');
    const output = tmpl(content, config);
    fsExt.ensureDirSync(path.dirname(dest));
    fs.writeFileSync(dest, output);
}

function loadConfig(file) {
    let ret = {};
    try{
        if(path.extname(file) === '.js') {
            ret = require(file);
        }else{
            ret = JSON.parse(fs.readFileSync(file, 'utf8'));
        }
    }catch(e){
        console.log(chalk.red(`error on loading ${file} ${e}`));
    }
    return ret;
}

function traverse(dir, cb) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filepath = path.join(dir, file);
        const stats = fs.statSync(filepath);
        if(stats.isDirectory()) {
            traverse(filepath, cb);
        }else if(stats.isFile()) {
            cb(filepath);
        }
    })
}

const cwd = () => fs.realpathSync(process.cwd());

const findUp = (fn, options = {}) => {
    let dir = options.cwd || cwd();
    const { root } = path.parse(dir);
    let found = fn(dir);
    while(!found && root !== dir) {
        dir = path.dirname(dir);
        found = fn(dir);
    }
    return found;
}

module.exports = {
    tmpl,
    copyTmpl,
    loadConfig,
    traverse,
    cwd,
    findUp,
};
