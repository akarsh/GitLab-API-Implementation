/**
  * Copyright (c) 2017 Akarsh Seggemu
**/
var express = require('express');
var router = express.Router();

var fs = require('fs'); // fs library https://www.npmjs.com/package/fs
var util = require('util'); // util library https://www.npmjs.com/package/util

var formidable = require("formidable"); // formidable library https://www.npmjs.com/package/formidable

/* GitLab nodeJS library to access GitLab API */
var gitlab = require('gitlab'); // gitlab library https://www.npmjs.com/package/gitlab

// Libraries for adb installation
var Promise = require('bluebird'); // bluebird library https://www.npmjs.com/package/bluebird
var adb = require('adbkit'); // adbkit library is a nodejs client for adb https://www.npmjs.com/package/adbkit
var request = require('request'); // request library to make http calls https://www.npmjs.com/package/request
var Readable = require('stream').Readable; // stream library https://www.npmjs.com/package/stream
var client = adb.createClient();

var axios = require('axios'); // axios library https://www.npmjs.com/package/axios

/* Global variables */
var storeProjectId = []; // Project Id
var storeProjectName = []; // Project Name
var storeProjectUsername = []; // Project username
var storeBranches = [];  //Branches
var storeBuildId = []; // Build Id
var storeBuildName = []; // Build Name
var storeBuildStatus = []; // Build Status
var storeBuildStage = []; // Build Stage
var storeBuildReference = []; // Build Reference
var storeBuildArtifacts = []; // Build Artifacts

var storeJSONParsedFilename = []; // Build Artifacts Filename parsed
var storeJSONParsedFileSize = []; // Build Artifacts File Size parsed

var branchesForThisProjectId; // Project Id of a selected branch
var branchesForThisProjectName;
var branchesForThisProjectUserName;

var BuildsForThisprojectBranchId; // Project Id of a selected build
var BuildsForThisprojectBranchProjectName;
var BuildsForThisprojectBranchProjectUserName;
var BuildsForThisprojectBranchName;

var installBuildsprojectName; // Project Name of a selected build that is installed
var installBuildsprojectBranchName;
var installBuildsprojectBranchBuildName;

var traceBuildsprojectName; // Project Name of a selected trace
var traceBuildsprojectBranchName;
var traceBuildsprojectBranchBuildName;

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

// This function process the data from index and displays the projects from GitLab.
function processAllFieldsOfTheProjectsForm(req, res) {
  var form = new formidable.IncomingForm();

  // Parses the form data and maps the form data.
  form.parse(req, function (err, fields) {
    // Credentials of GitLab Server
    credentials = {
      //  url: 'https://gitlab.com',
      url: 'https://gitlab.fokus.fraunhofer.de',
      // form data is mapped to key 'token'
       token: fields.tokenId
    };
    // Establishing the connection with credentials provided
    gitlab = new gitlab({
      url: credentials.url,
      token: credentials.token
    });
    // Listing projects
    gitlab.projects.all(function (projects) {
      for (var i = 0; i < projects.length; i++) {
        var project = projects[i];
        storeProjectId.push(project.id);
        storeProjectName.push(project.name);
        storeProjectUsername.push(project.owner.username);
      }
      renderProjectsPage(res);
      return storeProjectId;
    });
  });
}

function renderProjectsPage(res) {
  res.render('projects', {
    title: 'Projects',
    projectId: storeProjectId,
    projectName: storeProjectName,
    projectUserName: storeProjectUsername
  });
}

// This function process the data from projects and displays the branches from GitLab.
function processAllFieldsOfTheBranchesForm(req, res) {
  var form = new formidable.IncomingForm();

  // Parses the form data and maps the form data.
  form.parse(req, function (err, fields) {
    branchesForThisProjectId = fields.projectId;
    branchesForThisProjectName = fields.projectName;
    branchesForThisProjectUserName = fields.projectUserName;
    // Listing branches based on project id
      gitlab.projects.repository.listBranches(branchesForThisProjectId, function (branches) {
        for (var k = 0; k < branches.length; k++) {
          obj = branches[k];
          storeBranches.push(obj.name);
        }
        renderBranchesPage(res);
      });
  });
}

function renderBranchesPage(res) {
  res.render('branches', {
    title: 'Branches',
    branches: storeBranches,
    projectBranchId: branchesForThisProjectId,
    projectBranchProjectName: branchesForThisProjectName,
    projectBranchProjectUserName: branchesForThisProjectUserName
  });
}

// This function process the data from branches and displays the builds from GitLab.
function processAllFieldsOfTheBuildsForm(req, res) {
  var form = new formidable.IncomingForm();

  // Parses the form data and maps the form data.
  form.parse(req, function (err, fields) {
    BuildsForThisprojectBranchId = fields.projectBranchId;
    BuildsForThisprojectBranchProjectName = fields.projectBranchProjectName;
    BuildsForThisprojectBranchProjectUserName = fields.projectBranchProjectUserName;
    BuildsForThisprojectBranchName = fields.projectBranchName;
    // Listing builds based on project id
    gitlab.projects.builds.listBuilds(BuildsForThisprojectBranchId, function (result) {
      for (var j = 0; j < result.length; j++) {
        if (result[j].ref === fields.projectBranchName) {
          storeBuildId.push(result[j].id);
          storeBuildName.push(result[j].name);
          storeBuildStatus.push(result[j].status);
          storeBuildStage.push(result[j].stage);
          storeBuildReference.push(result[j].ref);
          if(result[j].artifacts_file !== undefined) {
            storeBuildArtifacts.push(result[j].artifacts_file);
            storeJSONParsedFilename.push(JSON.stringify(result[j].artifacts_file.filename).replace(/\"/g, ""));
            storeJSONParsedFileSize.push(JSON.stringify(result[j].artifacts_file.size));
          } else {
            storeBuildArtifacts.push("");
            storeJSONParsedFilename.push("");
            storeJSONParsedFileSize.push("");
          }
        }
      }
      renderBuildsPage(res);
    });
  });
}

function renderBuildsPage(res) {
  res.render('builds', {
    title: 'Builds',
    buildID: storeBuildId,
    buildName: storeBuildName,
    buildStatus: storeBuildStatus,
    buildStage: storeBuildStage,
    buildRefere: storeBuildReference,
    buildArtifacts: storeBuildArtifacts,
    gitLabUrl: credentials.url,
    projectName: BuildsForThisprojectBranchProjectName,
    projectUserName: BuildsForThisprojectBranchProjectUserName,
    projectBranchName: BuildsForThisprojectBranchName,
    JSONParsedFilename: storeJSONParsedFilename,
    JSONParsedFileSize: storeJSONParsedFileSize
  });
}

// This function process the data from builds and displays the trace from GitLab.
function processAllFieldsOfTraceForm(req, res) {
  var form = new formidable.IncomingForm();

  // Parses the form data and maps the form data.
  form.parse(req, function (err, fields) {
    // Data related to projects that has to be sent
    traceBuildsprojectName = fields.projectName;
    traceBuildsprojectBranchName = fields.projectBranchName;
    traceBuildsprojectBranchBuildName = fields.projectBranchBuildName;
    // This variable stores the dataUrl
    var urlToBeSent = fields.dataUrl;
    axios(urlToBeSent)
    .then(function(response) {
      responseInHtml = response.data.html;
      renderTracePage(res, responseInHtml);
    })
    .catch(function(error) {
      console.error(error.message);
    });
  });
}

function renderTracePage(res, responseInHtml) {
  res.render('trace', {
    title: 'trace',
    responseInHtml: responseInHtml,
    traceBuildsprojectName: traceBuildsprojectName,
    traceBuildsprojectBranchName: traceBuildsprojectBranchName,
    traceBuildsprojectBranchBuildName: traceBuildsprojectBranchBuildName
  });
}

// This function process the data from builds and displays the trace from GitLab.
function processAllFieldsOfInstallForm(req, res) {
  var form = new formidable.IncomingForm();

  // Parses the form data and maps the form data.
  form.parse(req, function (err, fields) {
    // Data related to projects that has to be sent
    installBuildsprojectName = fields.projectName;
    installBuildsprojectBranchName = fields.projectBranchName;
    installBuildsprojectBranchBuildName = fields.projectBranchBuildName;
    // This variable stores the dataUrl
    var urlToBeSent = fields.dataUrl;
    // This function installs the artifact file i.e. apk file on the connected devices
    function installAPKFile() {
      client.listDevices()
        .then(function (devices) {
          return Promise.map(devices, function (device) {
            return client.install(device.id, new Readable().wrap(request(urlToBeSent)));
          });
        })
        .then(function () {
          var installResponseSucess = "<h3>Installed the application on all connected devices</h3>";
          renderInstallPage(res, installResponseSucess);
        })
        .catch(function (err) {
         var failedResponse = "<h3>Something went wrong during the installation</h3><br />" + err.stack;
          console.error('Something went wrong:', err.stack);
          renderInstallPage(res, failedResponse);
        });
    }
    installAPKFile();
  });
}

function renderInstallPage(res, responseToDisplay) {
  res.render('install', {
    title: 'install',
    responseToDisplay: responseToDisplay,
    installBuildsprojectName: installBuildsprojectName,
    installBuildsprojectBranchName: installBuildsprojectBranchName,
    installBuildsprojectBranchBuildName: installBuildsprojectBranchBuildName
  });
}

module.exports = router;