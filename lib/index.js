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

/**
 * load scaffoldify configuration file
 * @param file (JSON or CJS module)
 */
function loadConfig(file) {
    let ret = {};
    try {
        if (path.extname(file) === '.js') {
            ret = require(file);
        } else {
            ret = JSON.parse(fs.readFileSync(file, 'utf8'));
        }
    } catch (e) {
        console.log(chalk.red(`error on loading ${file} ${e}`));
    }
    return ret;
}

/**
 * utility function to traverse a directory
 * @param dir directory to traverse
 * @param cb callback function for each file inside the directory and its sub directories
 */
function traverse(dir, cb) {
    fs.readdir(dir, (err, files) => {
        if (err) {
            console.log(
                chalk.red(`scaffoldify: error on traversing directory ${dir}`)
            );
            throw err;
        }
        files.forEach(file => {
            const filepath = path.join(dir, file);
            fs.stat(filepath, (err, stats) => {
                if (stats.isDirectory()) {
                    traverse(filepath, cb);
                } else if (stats.isFile()) {
                    cb(filepath);
                }
            });
        });
    });
}

/**
 * utility function to get current working directory equalent to unix cwd command
 * @returns {*}
 */
const cwd = () => fs.realpathSync(process.cwd());

module.exports = {
    tmpl,
    copyTmpl,
    loadConfig,
    traverse,
    cwd,
};
