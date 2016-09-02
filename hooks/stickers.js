var logString = "";
var console_log = function (txt) {
  logString += txt + '\n';
  console.error(txt);
};
var writeLog = function (iosFolder, projName) {
  var fs = require('fs');
  var dest = path.join(iosFolder, 'www', 'cordova_log.txt');
  fs.writeFile(dest, logString, function(err) {
      if(err) {
          return console.log(err);
      }
  }); 
};

console_log("Running stickers hook");

// note: I have no idea how to make a cordova plugin perform an npm install, so I simply included my fork of node-xcode in node_modules
var xcode = require('xcode');
var fs = require('fs');
var path = require('path');

// http://stackoverflow.com/a/26038979/5930772
var copyFileSync = function (source, target) {

    var targetFile = target;

    //if target is a directory a new file with the same name will be created
    if (fs.existsSync(target)) {
        if (fs.lstatSync(target).isDirectory()) {
            targetFile = path.join(target, path.basename(source));
        }
    }

    fs.writeFileSync(targetFile, fs.readFileSync(source));
};
var copyFolderRecursiveSync = function (source, target) {
    var files = [];

    //check if folder needs to be created or integrated
    var targetFolder = path.join(target, path.basename(source));
    if (!fs.existsSync(targetFolder)) {
        fs.mkdirSync(targetFolder);
    }

    //copy
    if (fs.lstatSync(source).isDirectory()) {
        files = fs.readdirSync(source);
        files.forEach(function (file) {
            var curSource = path.join(source, file);
            if (fs.lstatSync(curSource).isDirectory()) {
                copyFolderRecursiveSync(curSource, targetFolder);
            } else {
                copyFileSync(curSource, targetFolder);
            }
        });
    }
};

module.exports = function (context) {
    var Q = context.requireCordovaModule('q');
    var deferral = new Q.defer();

    if (context.opts.cordova.platforms.indexOf('ios') < 0) {
        throw new Error('This plugin expects the ios platform to exist.');
    }

    // Get the bundleid from config.xml
    var contents = fs.readFileSync(path.join(context.opts.projectRoot, "config.xml"), 'utf-8');
    if (contents) {
        // BOM
        contents = contents.substring(contents.indexOf('<'));
    }
    var elementTree = context.requireCordovaModule('elementtree');
    var etree = elementTree.parse(contents);
    var bundleId = etree.getroot().get('id');
    console_log('bundle id:', bundleId);

    var iosFolder = context.opts.cordova.project ? context.opts.cordova.project.root : path.join(context.opts.projectRoot, 'platforms/ios/');
    console_log("iosFolder: " + iosFolder);

    fs.readdir(iosFolder, function (err, data) {
        var projectFolder;
        var projectName;
        var run = function () {
            var pbxProject;
            var projectPath;
            var configGroups;
            var config;
            var resourcesFolderPath = path.join(iosFolder, projectName, 'Resources');

            projectPath = path.join(projectFolder, 'project.pbxproj');

            if (context.opts.cordova.project) {
                pbxProject = context.opts.cordova.project.parseProjectFile(context.opts.projectRoot).xcode;
            } else {
                pbxProject = xcode.project(projectPath);
                pbxProject.parseSync();
            }

            var stickerPackName = projectName + " Stickers";
            // var stickerPackName = "Stickers";

            pbxProject.addStickersTarget(stickerPackName + ".appex", bundleId, stickerPackName);
            stickersKey = pbxProject.addStickerResourceFile("Stickers.xcassets", {}, stickerPackName);

            // cordova makes a CustomTemplate pbxgroup, the stickersGroup must be added there
            var customTemplateKey = pbxProject.findPBXGroupKey({
                name: "CustomTemplate"
            });
            if (customTemplateKey) {
                pbxProject.addToPbxGroup(stickersKey, customTemplateKey);
            }


            configGroups = pbxProject.hash.project.objects.XCBuildConfiguration;
            for (var key in configGroups) {
                config = configGroups[key];
            }

            // write the updated project file
            fs.writeFileSync(projectPath, pbxProject.writeSync());
            console_log("Added Stickers Extension to " + projectName + " xcode project");

            var srcFolder;
            srcFolder = path.join(context.opts.projectRoot, 'www', projectName + ' Stickers/');
            if (!fs.existsSync(srcFolder)) {
                throw new Error('Missing stickers asset folder. Should be named "/<PROJECTNAME> Stickers/"');
            }


            // copy stickers folder
            copyFolderRecursiveSync(
                srcFolder,
                path.join(context.opts.projectRoot, 'platforms', 'ios')
            );
            console_log("Copied Stickers folder");

            writeLog();

            deferral.resolve();
        };

        if (err) {
            throw err;
        }

        // Find the project folder by looking for *.xcodeproj
        if (data && data.length) {
            data.forEach(function (folder) {
                if (folder.match(/\.xcodeproj$/)) {
                    projectFolder = path.join(iosFolder, folder);
                    projectName = path.basename(folder, '.xcodeproj');
                }
            });
        }

        if (!projectFolder || !projectName) {
            throw new Error("Could not find an .xcodeproj folder in: " + iosFolder);
        }

        run();

    });


    return deferral.promise;
};