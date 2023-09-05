/**
 * Usage:
 *  example command: node ./download-documents.js path=./examples token=1e7a4c5b-893e-580f-96f2-29e62d5de99c routeId=186
 *  arguments:
 *    path: target directory to store documents
 *    token: cms site token
 *    routeId: top route id for cms site
 *
 *  target directory structure:
 *    entry:
 *      zh: xx.md / dir
 *      en: xx.md / dir
 */

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch-commonjs');

// configs
const languages = ['zh', 'en'];
const ignores = ['README.md', 'readme.md'];

// CMS Domain

const CMSDomain = 'https://cms-cn.zijieapi.com';

// CMS Top Routes

const vchartExampleRouteId = 186;
const vchartGuideRouteId = 51;
const vchartAPIRouteId = 439;

const vtableExampleRouteId = 893;

const vgrammarExampleRouteId = 593;
const vgrammarGuideRouteId = 966;
const vgrammarAPIRouteId = 464;

const vrenderExampleRouteId = 760;
const vrenderGuideRouteId = 137;

// CMS Default Routes

const vchartGuideDefaultRoute = 'tutorial_docs/VChart_Website_Guide';
const vchartOptionDefaultRoute = 'barChart';
const vchartAPIDefaultRoute = 'API/vchart';

const vtableGuideDefaultRoute = 'Getting_Started/Getting_Started';
const vtableOptionDefaultRoute = 'ListTable';
const vtableAPIDefaultRoute = 'Methods';

const vgrammarGuideDefaultRoute = 'guides/quick-start';
const vgrammarOptionDefaultRoute = '';
const vgrammarAPIDefaultRoute = 'API/View';

const vrenderGuideDefaultRoute = 'asd/VRender_Website_Guide';

// CMS Token

const tokenEnum = {
  vchartDemo: '1e7a4c5b-893e-580f-96f2-29e62d5de99c',
  vchartGuide: 'dc79e81f-bd0a-504c-825c-ce3f03cfd265',
  vchartAPI: 'a79cad5f-889c-5cf2-888a-f82e6d92ba55',

  vtableDemo: '28dbb65d-54be-53e0-8a20-7e93d0dc5cc8',
  vtableGuide: '03430e05-d316-5621-b90e-d3c33f2a2a4d',

  vgrammarDemo: '02cd267d-ea09-555b-ac32-2275dd2faa17',
  vgrammarGuide: '59677583-a493-5305-851a-1153c93e2234',
  vgrammarAPI: '9369d0a5-5dd6-504a-8086-66fdd3b3684f',

  vrenderDemo: '297426ca-15e4-51d3-83c8-70fc4594ce11',
  vrenderGuide: '21b79304-2124-5ec7-a57e-d79dece3b3a8'
};

// arguments
const arguments = process.argv.slice(2);

let targetDirectory = path.resolve(__dirname);
let token = '';
let routeId = -1;
for (const argument of arguments) {
  if (argument.startsWith('path=')) {
    targetDirectory = argument.split('path=')[1];
  } else if (argument.startsWith('token=')) {
    token = argument.split('token=')[1];
  } else if (argument.startsWith('routeId=')) {
    routeId = argument.split('routeId=')[1];
  }
}
if (token === '') {
  console.error('Invalid parameters! Please refer to the cms config in the scripts.');
}
targetDirectory = path.resolve(targetDirectory);
const targetEntry = targetDirectory.split('/')[targetDirectory.split('/').length - 1];

async function fetchCMSData(token, url, plain) {
  const response = await fetch(`${CMSDomain}${url}`, {
    method: 'GET',
    mode: 'cors',
    cache: 'default',
    headers: {
      // 'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
      Authorization: token
    }
  });
  const json = await response.json();
  const data = plain ? json : json?.data;
  return data;
}

async function fetchRoutes(routeId, token) {
  if (routeId === -1) {
    const routeData = await fetchCMSData(token, `/api/open/site`, false);
    return routeData.routes;
  }
  const routeData = await fetchCMSData(token, `/api/open/site/top/${routeId}`, false);
  return routeData[0].children;
}

async function generateRouteData(route, parentMenuItem, rootDirectory, directory, token) {
  // not downloading any readme file
  if (route.path.indexOf('README') >= 0) {
    return;
  }
  if (route.children) {
    for (const language of languages) {
      const targetPath = path.join(rootDirectory, language, directory, route.path);
      // create directory
      if (!fs.existsSync(targetPath)) {
        fs.mkdirSync(targetPath);
      }
    }
    const menuItem = {
      path: route.path,
      title: {
        zh: route.name['1'],
        en: route.name['2']
      },
      children: []
    };
    parentMenuItem.children.push(menuItem);
    for (const subRoute of route.children) {
      await generateRouteData(subRoute, menuItem, rootDirectory, path.join(directory, route.path), token);
    }
  } else {
    const menuItem = {
      path: route.path,
      title: {}
    };
    parentMenuItem.children.push(menuItem);
    for (const language of languages) {
      const languageIndex = languages.indexOf(language) + 1;
      const document = await fetchCMSData(
        token,
        `/api/open/document?fullPath=${route.fullPath}&language=${languageIndex}`,
        false
      );
      const content = document[0].content;
      if (!content || content === '') {
        console.log(`Empty document: ${route.fullPath}`);
        return;
      }
      const meta = JSON.parse(document[0].meta);
      menuItem.title[language] = meta.title;
      const targetPath = path.resolve(rootDirectory, language, directory, `${route.path}.md`);
      fs.writeFileSync(targetPath, content, { encoding: 'utf8' });
    }
    console.log(`Generate document: ${route.fullPath}`);
  }
}

// token = tokenEnum.vtableGuide;
// // routeId = vchartExampleRouteId;
// targetDirectory = './tutorials';

async function run() {
  const routes = await fetchRoutes(routeId, token);

  const menu = {
    menu: targetEntry,
    children: []
  };
  const targetFullPath = path.resolve(targetDirectory);
  if (!fs.existsSync(targetFullPath)) {
    fs.mkdirSync(targetFullPath);
  }
  for (const language of languages) {
    const languageFullPath = path.join(targetDirectory, language);
    if (!fs.existsSync(languageFullPath)) {
      fs.mkdirSync(languageFullPath);
    }
  }
  for (const route of routes) {
    await generateRouteData(route, menu, targetFullPath, '', token);
  }
  const menuResult = JSON.stringify(menu, null, 2);
  const menuPath = path.join(targetDirectory, 'menu.json');
  fs.writeFileSync(menuPath, menuResult, { encoding: 'utf8' });

  console.log('Successfully download all documents!');
}

run();
