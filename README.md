# GitLab-API-Implementation

This project demonstrates, how to integrate gitlab api and abdkit library in a simple website application using nodejs.

## Table of Contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Project file structure](#project-file-structure)
- [Tutorial](#tutorial)
- [Credits](#credits)

### Introduction

This project was created to make it easy for the testers to download an artifact file i.e. apk file without navigating through the multiple pages in GitLab website. and it integrates the adbkit. Which allows the tester to install the artifact file i.e. apk file on all the connected devices to the computer; where this application is running.

Note: You need to initialise adb on the computer and check all the devices are connected to the computer via

    $ adb devices

**Note:**

> For more details on the gitlab library. Refer to [node-gitlab](https://github.com/node-gitlab/node-gitlab)

> For more details on the adbkit library. Refer to [adbkit](https://github.com/openstf/adbkit)

## Installation

cd into folder `GitLab-API-Implementation` then

    npm install -save

### Project file structure

* [`app.js`](app.js) - Application starting point
* [`node_modules/`](node_modules) - Contains all the downloaded dependent node modules
* [`public/`](public) - Contains the image files, js files and css dependencies
* [`package.json`](package.json) - Contains the dependency configuration for npm managed node modules
* [`routes/`](routes) - URL(HTTP method) to controller mapping and all file paths of jade files are declared
* [`views/`](views) - Contains the view templates for the application

### Tutorial

The library files are declared
```
var http = require('http'); // http library https://www.npmjs.com/package/http
var fs = require('fs'); // fs library https://www.npmjs.com/package/fs
var formidable = require("formidable"); // formidable library https://www.npmjs.com/package/formidable
var util = require('util'); // util library https://www.npmjs.com/package/util

// Express library for routing. Refer to documentation https://expressjs.com/en/guide/routing.html for more details.
var express = require('express'); // express library https://www.npmjs.com/package/express
var app = express();

// GitLab nodeJS library to access GitLab API
var gitlab = require('gitlab'); // gitlab library https://www.npmjs.com/package/gitlab

// Libraries for adb installation
var Promise = require('bluebird') // bluebird library https://www.npmjs.com/package/bluebird
var adb = require('adbkit') // adbkit library is a nodejs client for adb https://www.npmjs.com/package/adbkit
var request = require('request') // request library to make http calls https://www.npmjs.com/package/request
var Readable = require('stream').Readable // stream library https://www.npmjs.com/package/stream
var client = adb.createClient()
```

The global variables are declared
```
// Global variables
var storeProjectId; // Project Id
var storeProjectName; // Project Name
var storeProjectUsername; // Project username
var storeBranches = [];  //Branches
var storeBuildId = []; // Build Id
var storeBuildName = []; // Build Name
var storeBuildStatus = []; // Build Status
var storeBuildStage = []; // Build Stage
var storeBuildReference = []; // Build Reference
var storeBuildArtifacts = []; // Build Artifacts
```

Express library is used to do the routing

```js
/* GET home page. */
router.get('/', function (req, res) {
  res.render('index', {
    title: 'Home'
  });
});

/* POST projects page. */
router.post('/projects', function (req, res) {
  processAllFieldsOfTheProjectsForm(req, res);
});

/* POST branches page. */
router.post('/projects/branches', function (req, res) {
  processAllFieldsOfTheBranchesForm(req, res);
});

/* POST builds page. */
router.post('/projects/branches/builds', function (req, res) {
  processAllFieldsOfTheBuildsForm(req, res);
});

/* POST trace page. */
router.post('/projects/branches/builds/trace', function (req, res) {
  processAllFieldsOfTraceForm(req, res);
});

/* POST trace page. */
router.post('/projects/branches/builds/install', function (req, res) {
  processAllFieldsOfInstallForm(req, res);
});
```

**Note:**

> For tutorial on how the adbkit is used to install an apk file. Refer to [adkit-install-apk-tutorial](https://github.com/akarsh/adkit-install-apk-tutorial)

### Credits

This project uses Open Source components. You can find the source code of their open source projects along with license information below. We acknowledge and are grateful to these developers for their contributions to open source.

* Project: [express](https://github.com/expressjs/express)

  Author: [209+ contributors](https://github.com/expressjs/express/graphs/contributors)

  License: [MIT](https://github.com/expressjs/express/blob/master/LICENSE)

* Project: [node-formidable](https://github.com/felixge/node-formidable)

  Author: [58 contributors](https://github.com/felixge/node-formidable/graphs/contributors)

  License: [MIT](https://github.com/felixge/node-formidable/blob/master/LICENSE)

* Project: [node-gitlab](https://github.com/node-gitlab/node-gitlab)

  Author: [41 contributors](https://github.com/node-gitlab/node-gitlab/graphs/contributors)

  License: [MIT](https://github.com/node-gitlab/node-gitlab/blob/develop/LICENSE.md)

* Project: [node-util](https://github.com/defunctzombie/node-util)

  Author: [3 contributors](https://github.com/defunctzombie/node-util/graphs/contributors)

  License: [MIT](https://github.com/defunctzombie/node-util/blob/master/LICENSE)

* Project: [bluebird](https://github.com/petkaantonov/bluebird)

  Author: [185 contributors](https://github.com/petkaantonov/bluebird/graphs/contributors)

  License: [MIT](https://github.com/petkaantonov/bluebird/blob/master/LICENSE)

* Project: [adbkit](https://github.com/openstf/adbkit)

  Author: [9 contributors](https://github.com/openstf/adbkit/graphs/contributors)

  License: [Apache-2.0](https://github.com/openstf/adbkit/blob/master/LICENSE)

* Project: [request](https://github.com/request/request)

  Author: [273 contributors](https://github.com/request/request/graphs/contributors)

  License: [Apache-2.0](https://github.com/request/request/blob/master/LICENSE)

* Project: [stream](https://github.com/juliangruber/stream)

  Author: [3 contributors](https://github.com/juliangruber/stream/graphs/contributors)

  License: [MIT](https://github.com/juliangruber/stream#license)

* Project: [axios](https://github.com/axios/axios)

  Author: [110 contributors](https://github.com/axios/axios/graphs/contributors)

  License: [MIT](https://github.com/axios/axios/blob/master/LICENSE)