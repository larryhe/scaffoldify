#!/usr/bin/env node
const os = require('os');
const fs = require('fs');
const path = require('path');
const parse = require('minimist');
const chalk = require('chalk');
const scaffoldify = require('../index');
const { loadConfig, cwd } = require('../lib');

const args = parse(process.argv.slice(2));

function usage() {
    console.log(`Usage: scaffoldify [options]
                        for more information, check out http://github.com/larryhe/scaffoldify
                        --help,-h           show help
                        --config,-c         path to scaffoldify configuration file
                        --templates,-t      path to templates folder
    `);
}

(function() {
    if (args.h || args.help) {
        usage();
        process.exit(0);
    }

    let config = args.config || args.c;
    if (!config) {
        const scaffoldifyrc = path.join(os.homedir(), '.scaffoldifyrc');
        const scaffoldConfigJs = path.join(cwd(), 'scaffoldify.config.js');
        if (fs.existsSync(scaffoldConfigJs)) {
            config = scaffoldConfigJs;
            console.log(chalk.yellow(`using ${config}`));
        } else if (fs.existsSync(scaffoldifyrc)) {
            config = scaffoldifyrc;
            console.log(
                chalk.yellow(`config file not specified, use ${config} instead`)
            );
        } else {
            console.log(
                chalk.yellow(
                    `config file not specified, use default configuration`
                )
            );
        }
    }

    config = loadConfig(config);

    const templateHome = args.templates || args.t || config.templates;
    if (!templateHome) {
        console.log(chalk.yellow(`template directory is not provided`));
        usage();
        process.exit(0);
    }

    config.templates = templateHome;

    scaffoldify(config);
})();
