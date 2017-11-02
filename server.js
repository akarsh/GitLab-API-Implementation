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

// HTTP methods used without any third party library
// var server = http.createServer(function (req, res) {
//     if (req.method.toLowerCase() == 'get') {
//         displayForm(res);
//     } else if (req.method.toLowerCase() == 'post') {
//         processAllFieldsOfTheForm(req, res);
//     }
//     //  else if (req.method.toLowerCase() == 'post') {
//     //     secondProcessTheButtonFrom(req, res);
//     // }
// });

// Serves resources to the static web pages
// The public folder has sub-folder images. Which contains the images.
app.use(express.static(__dirname + '/public'));

// GET method that displays the form.html
app.get('/', function (req, res) {
    displayForm(res);
})
// POST method that process the data from form.html
app.post('/step1', function (req, res) {
    processAllFieldsOfTheForm(req, res);
});
// POST method that process the dataUrl sent from the step1 and install the artifact file i.e. apk file on the connected device.
app.post('/step2', function (req, res) {
    secondProcessTheButtonFrom(req, res);
})

// This function displays the form.html
function displayForm(res) {
    fs.readFile('form.html', function (err, data) {
        res.writeHead(200, {
            'Content-Type': 'text/html',
            'Content-Length': data.length
        });
        res.write(data);
        res.end();
    });
}

// This function process the data from form.html and displays the projects from GitLab.
function processAllFieldsOfTheForm(req, res) {
    var form = new formidable.IncomingForm();

    // Parses the form data and maps the form data.
    form.parse(req, function (err, fields) {
        // Credentials of GitLab Server
        credentials = {
            url: 'https://gitlab.com',
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
            var i, len, project;
            for (i = 0, len = projects.length; i < len; i++) {
                project = projects[i];
                storeProjectId = project.id;
                storeProjectName = project.name;
                storeProjectUsername = project.owner.username;
                // getGitLabUsers(storeProjectId);
                getGitLabBranches(storeProjectId);
                getGitLabBuilds(storeProjectId);
                return storeProjectId;
            }
        });

        // Listing build
        function getGitLabBuilds(storeProjectId) {
            gitlab.projects.builds.listBuilds(storeProjectId, function (result) {
                for (var j = 0; j < result.length; j++) {
                    obj = result[j];
                    storeBuildId.push(obj.id);
                    storeBuildName.push(obj.name);
                    storeBuildStatus.push(obj.status);
                    storeBuildStage.push(obj.stage);
                    storeBuildReference.push(obj.ref);
                    storeBuildArtifacts.push(obj.artifacts_file);
                }
                loadThePage();
                return storeBuildId;
            })
        }

        // Listing branches based on project id
        function getGitLabBranches(storeProjectId) {
            gitlab.projects.repository.listBranches(storeProjectId, function (branches) {
                for (var k = 0; k < branches.length; k++) {
                    obj = branches[k];
                    storeBranches.push(obj.name);
                }
            })
        }

        // This function loads the pages dynamically
        function loadThePage() {
            res.writeHead(200, {
                'content-type': 'text/html'
            });
            res.write(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <title>RoCIiMD</title>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
                <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
                <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
            </head>
            <body>
                <div class="container">
                    <div class="jumbotron">
                        <!-- Chair for Open Distributed Systems -->
                        <img align="right" src="/images/ODS_logo.png" width="90" style="margin-left: 2%; margin-right: 2%;">
                        <!-- Technische Universität Berlin -->
                        <img align="right" src="/images/logo.svg" width="70">
                        <br />
                        <br />
                        <br />
                        <br />
                        <h3>Implentation and integration of GitLab API with adbkit library</h3>
                        <p>This projet website is created part of the master thesis "Review on CI in Mobile Development" (RoCIiMD)</p>
                        <strong>Supervisor:</strong> André Paul
                        <br />
                        <strong>Student:</strong> Akarsh Seggemu
                        <br />
                        <br /> in cooperation with
                        <br />
                        <!-- Fraunhofer-Institut für Offene Kommunikationssysteme (FOKUS) -->
                        <img src="http://localhost:1185/images/FF_logo.png" width="140" alt="Logo of FOKUS">
                        <br />
                        <br />
                        <br />
                        <br />
                        <br />
                        <h3>Projects</h3>
                        <!-- Shows projects on the browser -->
                        <p>` + storeProjectName + `</p>
                        <br />
                        <!-- Shows branches on the browser -->
                        <h4>Branches</h4>
            `);
            // For loop that iterates and displays the branches
            for (var iterationNumberOne = 0; iterationNumberOne < storeBranches.length; iterationNumberOne++) {
                res.write(storeBranches[iterationNumberOne] + '<br />');
            }
            res.write(`
            <br />
            <!-- Shows builds on the browser -->
            <h4>Build details</h4>
            <br />
            <table>
                <tr>
                    <th>Id</th>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Stage</th>
                    <th>Reference branch &nbsp; &nbsp; &nbsp; </th>
                    <th>Artifact (filename and size)  &nbsp;  &nbsp;  &nbsp; </th>
                    <th>Download artifact &nbsp; &nbsp; &nbsp; &nbsp; </th>
                    <th>Install artifact</th>
                </tr>
            `);
            // For loop that iterates and displays the build details
            for (var iterationNumber = 0; iterationNumber < storeBuildId.length; iterationNumber++) {
                res.write(`
                <tr>
                    <td>` + storeBuildId[iterationNumber] + ` &nbsp; &nbsp; &nbsp; &nbsp; </td>
                    <td>` + storeBuildName[iterationNumber] + ` &nbsp; &nbsp; &nbsp; &nbsp; </td>
                    <td>` + storeBuildStatus[iterationNumber] + ` &nbsp; &nbsp; &nbsp; </td>
                    <td>` + storeBuildStage[iterationNumber] + ` &nbsp; &nbsp; &nbsp; &nbsp; </td>
                    <td>` + storeBuildReference[iterationNumber] + `</td>
                `);
                // If loop that omits displaying builds that does not contain artifact files.
                if (storeBuildArtifacts[iterationNumber] != undefined) {
                    res.write(`
                        <td>` + JSON.stringify(storeBuildArtifacts[iterationNumber].filename).replace(/\"/g, "") + `, ` + JSON.stringify(storeBuildArtifacts[iterationNumber].size) + `</td>
                        <td>
                            <a class="glyphicon glyphicon-cloud-download" aria-hidden="true" href="` + credentials.url + '/' + storeProjectUsername + '/' + storeProjectName + '/-/jobs/' + storeBuildId[iterationNumber] + `/artifacts/download' + '">
                            </a>
                        </td>
                        <td>
                            <form action="/step2" method="post" enctype="multipart/form-data">
                                <fieldset>
                                    <input type="hidden" name="dataUrl" value="` + credentials.url + '/' + storeProjectUsername + '/' + storeProjectName + '/-/jobs/' + storeBuildId[iterationNumber] + '/artifacts/raw/app/build/outputs/apk/app-debug.apk' + `" />
                                    <input type="submit" value="Install" />
                                </fieldset>
                            </form>
                        </td>
                    </tr>
                    `);
                } else {
                    res.write('<td></td></tr>');
                }
            }
            // Button to send data url
            res.write(`
                        </table>
                    </div>
                </div>
                <div class="container">
                <!-- Footer -->
                <div id="footer">
                    <p>Copyright © 2017. Made with &hearts; by
                        <a href="https://akarsh.github.io/" target="_blank">Akarsh Seggemu</a>.</p>
                </div>
            </div>
            </body>
            </html>
            `);
            res.end();
        }
    });
}

// This function process the data from step1 page 
function secondProcessTheButtonFrom(req, res) {
    var form = new formidable.IncomingForm();

    // Parses the form data and maps the form data.
    form.parse(req, function (err, fields) {
        // This variable stores the dataUrl
        var urlToBeSent = fields.dataUrl;

        // To check if the dataUrl is containing the correct url to download the apk file or not.
        // console.log(fields.dataUrl);

        // Wrties the head of the new html page
        res.writeHead(200, {
            'content-type': 'text/html'
        });
        res.write(`
        <!DOCTYPE html>
        <html lang="en">            
        <head>
            <title>RoCIiMD</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
            <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
            <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
        </head>
        <body>
        <div class="container">
            <div class="jumbotron">
                <!-- Chair for Open Distributed Systems -->
                <img align="right" src="/images/ODS_logo.png" width="90" style="margin-left: 2%; margin-right: 2%;">
                <!-- Technische Universität Berlin -->
                <img align="right" src="/images/logo.svg" width="70">
                <br />
                <br />
                <br />
                <br />
                <h3>Implentation and integration of GitLab API with adbkit library</h3>
                <p>This projet website is created part of the master thesis "Review on CI in Mobile Development" (RoCIiMD)</p>
                <strong>Supervisor:</strong> André Paul
                <br />
                <strong>Student:</strong> Akarsh Seggemu
                <br />
                <br /> in cooperation with
                <br />
                <!-- Fraunhofer-Institut für Offene Kommunikationssysteme (FOKUS) -->
                <img src="http://localhost:1185/images/FF_logo.png" width="140" alt="Logo of FOKUS">
                <br />
                <br />
                <br />
                <br />
                <br />
        `);

        // This function installs the artifact file i.e. apk file on the connected devices
        function installAPKFile() {
            client.listDevices()
                .then(function (devices) {
                    return Promise.map(devices, function (device) {
                        // return client.install(device.id, new Readable().wrap(request('https://gitlab.com/sakarsh/gitlab-ci-android/-/jobs/31927817/artifacts/raw/app/build/outputs/apk/app-debug.apk')))
                        return client.install(device.id, new Readable().wrap(request(urlToBeSent)))
                    })
                })
                .then(function () {
                    res.write(`
                                <h3>Installed the application on all connected devices</h3>
                            </div>
                        </div>
                        <div class="container">
                            <!-- Footer -->
                            <div id="footer">
                                <p>Copyright © 2017. Made with &hearts; by
                                    <a href="https://akarsh.github.io/" target="_blank">Akarsh Seggemu</a>.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                    `);

                    res.end();
                    console.log('Installed %s on all connected devices', new Readable().wrap(request('https://gitlab.com/sakarsh/gitlab-ci-android/-/jobs/31927817/artifacts/raw/app/build/outputs/apk/app-debug.apk')))
                })
                .catch(function (err) {
                    res.write(`
                                <h3>Something went wrong during the installation</h3>
                                `+ err.stack + `
                            </div>
                        </div>
                        <div class="container">
                            <!-- Footer -->
                            <div id="footer">
                                <p>Copyright © 2017. Made with &hearts; by
                                    <a href="https://akarsh.github.io/" target="_blank">Akarsh Seggemu</a>.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                    `);

                    res.end();
                    console.error('Something went wrong:', err.stack)
                })
        }

        // Invoke the installAPKFile function
        installAPKFile();
    });
}

// Server listening on port 1185!
app.listen(1185, function () {
    console.log('Listening on port 1185!')
})