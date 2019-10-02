const { fs, vol } = require('memfs');
const scaffoldify = require('../index');

jest.mock('fs-extra', () => {
    const vol = require('memfs');
    return {
        ensureDirSync(dir) {
            vol.mkdirSync(dir, {recursive: true});
        }
    }
});

jest.mock('fs', () => {
    const fs = require('memfs');
    return fs;
});

jest.mock('inquirer', () => {
    return {
        prompt() {
            return Promise.resolve({Hello: 'HelloWorld', hello: 'hello,world'});
        }
    };
});

const home = '/home/users';
const config = {
    cwd: home,
    templates: '/templates',
};

describe('simple copy templates to destination', () => {
    test('plain text templates without .tmpl extention', () => {
        vol.fromJSON({
            './README.md': '#1',
            './src/index.js': '//index.js',
            './deep/nested/folder/test.txt': 'nested',
        }, '/templates');
        scaffoldify(config).then(() => {
            expect(fs.readFileSync(`${home}/README.md`, 'utf8')).toBe('#1');
            expect(fs.readFileSync(`${home}/src/index.js`, 'utf8')).toBe('//index.js');
            expect(fs.readFileSync(`${home}/deep/nested/folder/test.txt`, 'utf8')).toBe('nested');
        });
    });
    test('plain text templates with .tmpl extention', () => {
        vol.fromJSON({
            './README.md.tmpl': '#1',
            './src/index.js.tmpl': '//index.js',
            './deep/nested/folder/test.txt.tmpl': 'nested',
        }, '/templates');
        scaffoldify(config).then(() => {
            expect(fs.readFileSync(`${home}/README.md`, 'utf8')).toBe('#1');
            expect(fs.readFileSync(`${home}/src/index.js`, 'utf8')).toBe('//index.js');
            expect(fs.readFileSync(`${home}/deep/nested/folder/test.txt`, 'utf8')).toBe('nested');
        });
    });
});

describe('cjs syntax based templates with different configuration', () => {
    const mappers = [
        'README.md=>ui/readme.md',
        'src/index.js => [ui]/index.js',
        {from: 'index.test.js', to: ()=> 'ui/src/__test__/index.test.js'},
    ];
    beforeEach(() => {
        vol.fromJSON({
            './README.md': '#tag<%=tag%>',
            './src/index.js': '//<%=Hello%>',
            './index.test.js': '<%=hello%>',
        }, '/templates');
    });
    test('different form of mappers', () => {
        scaffoldify({
            ...config,
            options: {tag: 1, ui: 'ui/src'},
            mappers: [
                'README.md=>ui/readme.md',
                'src/index.js => [ui]/index.js',
                {from: 'index.test.js', to: ()=> 'ui/src/__test__/index.test.js'},
            ],
        }).then(() => {
            expect(fs.readFileSync(`${home}/ui/readme.md`, 'utf8')).toBe('#tag1');
            expect(fs.readFileSync(`${home}/ui/src/index.js`, 'utf8')).toBe('//HelloWorld');
            expect(fs.readFileSync(`${home}/ui/src/__test__/index.test.js`, 'utf8')).toBe('hello,world');
        });
    });
    test('mappers with transform', () => {
        scaffoldify({
            ...config,
            options: {tag: 1, ui: 'ui/src'},
            mappers:[
                'README.md=>ui/readme.md',
                'src/index.js => [ui]/index.js',
                {from: 'index.test.js', to: ()=> 'ui/src/__test__/index.test.js'},
            ],
            transform: answers => {
                answers.Hello = 'TRANSFORMED';
                answers.hello = 'transformed';
                return answers;
            },
        }).then(() => {
            expect(fs.readFileSync(`${home}/ui/readme.md`, 'utf8')).toBe('#tag1');
            expect(fs.readFileSync(`${home}/ui/src/index.js`, 'utf8')).toBe('//TRANSFORMED');
            expect(fs.readFileSync(`${home}/ui/src/__test__/index.test.js`, 'utf8')).toBe('transformed');
        });
    });
});

describe('overwrite option', ()=> {
    vol.fromJSON({
        './overwrite.md': '#overwrite',
        './existed.js': '//TODO',
    }, '/templates');

    vol.fromJSON({
        './dest/overwrite.md': '#overwrite',
        './dest/existed.js': '//existed',
    }, home);

   test('overwrite existing file', () => {
       scaffoldify({
           ...config,
           options: {tag: '1'},
           mappers: [
               'existed.md=>dest/existed.md',
               'existed.js => dest/existed.js?overwrite=false',
           ],
       }).then(() => {
           expect(fs.readFileSync(`${home}/dest/overwrite.md`, 'utf8')).toBe('#overwrite');
           expect(fs.readFileSync(`${home}/dest/existed.js`, 'utf8')).toBe('//existed');
       });
   });
});


