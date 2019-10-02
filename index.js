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
    }) || {};
    return answers => {
        const base = path.basename(tmpl, '.tmpl');
        const dir = path.dirname(tmpl);
        let to = path.join(dir, base);
        if (maper.to) {
            to = maper.to;
        }
        if (isFunction(to)) {
            to = to(answers);
        } else {
            to = to.replace(/\[(.+?)\]/g, (match, group) => answers[group]);
        }
        return {
            to,
            overwrite: maper.overwrite === false ? false : true,
        };
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
    if(!isFunction(raw.transform)) {
        raw.transform = answers => answers;
    }
    raw.cwd = raw.cwd || cwd();
    raw.mappers = raw.mappers || [];
    raw.mappers = raw.mappers.filter(or(isString, isObject)).map(m => {
        if (isObject(m)) {
            return {
                from: m.from.trim(),
                to: isFunction(m.to) ? m.to : m.to.trim(),
                overwrite: m.overwrite === false ? false : true,
            };
        } else {
            const items = m.split('=>');
            const to = items[1].trim();
            return { from: items[0].trim(), to: to.replace(/\?.+/g, ''), overwrite: /overwrite=false/.test(to) ? false : true };
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
    return inquirer.prompt(config.inquiries)
        .then(answers => {
            const options = config.options || {};
            return {
                ...options,
                ...answers,
            };
        })
        .then(config.transform)
        .then(answers => {
        traverse(templateHome, tmpl => {
            const mapper = getMapper(config, tmpl);
            const dest = mapper(answers);
            if(dest.to) {
                const target = path.join(config.cwd, dest.to);
                if(!fs.existsSync(target) || dest.overwrite) {
                    copyTmpl(tmpl, target, answers);
                }
            }
        });
        return answers;
    });
}

module.exports = scaffoldify;
