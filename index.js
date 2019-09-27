const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const { isString, isObject, isFunction } = require('lodash');
const { traverse, copyTmpl, cwd } = require('./lib');

/**
 * get template file's mapper function from mappers configuration. if no mapper is defined for a template
 * a default map function to return the same folder structure and file name as template will be used.
 * @param config
 * @param tmpl
 * @returns {function(*=): (void|string)}
 */
function getMapper(config, tmpl) {
    const mappers = config.mappers || [];
    const prefix = path.join(config.templates, '/');
    tmpl = tmpl.replace(prefix, '');
    const maper = mappers.find(m => {
        return m.from.endsWith(tmpl);
    });
    return answers => {
        let to = path.basename(tmpl, '.tmpl');
        if (maper) {
            to = maper.to;
        }
        if (isFunction(to)) {
            to = to(answers);
        } else {
            to = to.replace(/\[(.+?)\]/g, (match, group) => answers[group]);
        }
        return to;
    };
}

const or = (fn1, fn2) => arg => fn1(arg) || fn2(arg);

/**
 * compile user configuration into a structured object graph
 * @param raw
 */
function compile(raw) {
    const templates = raw.templates;
    if (!fs.existsSync(templates)) {
        throw new Error(`templates [${templates}] do not exist `);
    }
    raw.cwd = raw.cwd || cwd();
    raw.mappers = raw.mappers || [];
    raw.mappers = raw.mappers.filter(or(isString, isObject)).map(m => {
        if (isObject(m)) {
            return {
                from: m.from.trim(),
                to: isFunction(m.to) ? m.to : m.to.trim(),
            };
        } else {
            const items = m.split('=>');
            return { from: items[0].trim(), to: items[1].trim() };
        }
    });
}

/**
 * scaffolding based on configuration
 * @param config
 */
function scaffoldify(config) {
    compile(config);
    const templateHome = config.templates;
    inquirer.prompt(config.inquiries).then(answers => {
        traverse(templateHome, tmpl => {
            const mapper = getMapper(config, tmpl);
            const dest = mapper(answers);
            copyTmpl(tmpl, path.join(config.cwd, dest), answers);
        });
    });
}

module.exports = scaffoldify;
