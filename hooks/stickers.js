// using error to see if this shows up in AB
console.error("Running hook");

var xcode = require('./xcode'),
    fs = require('fs'),
    path = require('path');

module.exports = function (context) {
    var Q = context.requireCordovaModule('q');
    var deferral = new Q.defer();

    if (context.opts.cordova.platforms.indexOf('ios') < 0) {
        throw new Error('This plugin expects the ios platform to exist.');
    }

    var iosFolder = context.opts.cordova.project ? context.opts.cordova.project.root : path.join(context.opts.projectRoot, 'platforms/ios/');
    console.error("iosFolder: " + iosFolder);

    fs.readdir(iosFolder, function (err, data) {
        var projFolder;
        var projName;
        var run = function () {
            var pbxProject;
            var projectPath;
            var configGroups;
            var config;
            var resourcesFolderPath = path.join(iosFolder, projName, 'Resources');

            projectPath = path.join(projFolder, 'project.pbxproj');

            if (context.opts.cordova.project) {
                pbxProject = context.opts.cordova.project.parseProjectFile(context.opts.projectRoot).xcode;
            } else {
                pbxProject = xcode.project(projectPath);
                pbxProject.parseSync();
            }

            // pbxProject.addTarget("Stickers.appex", "app_extension_messages_sticker_pack", "Stickers");
            // stickersKey = pbxProject.addStickerResourceFile("Stickers.xcassets", {}, "Stickers");

            // cordova makes a CustomTemplate pbxgroup, the stickersGroup must be added there
            // var customTemplateKey = pbxProject.findPBXGroupKey({
            //     name: "CustomTemplate"
            // });
            // if (customTemplateKey) {
            //     pbxProject.addToPbxGroup(stickersKey, customTemplateKey);
            // }


            // configGroups = pbxProject.hash.project.objects['XCBuildConfiguration'];
            // for (var key in configGroups) {
            //     config = configGroups[key];
            // }

            // write the updated project file
            fs.writeFileSync(projectPath, pbxProject.writeSync());
            console.error("Added Stickers to '" + projName + "'");

            deferral.resolve();
        };

        if (err) {
            throw err;
        }

        // Find the project folder by looking for *.xcodeproj
        if (data && data.length) {
            data.forEach(function (folder) {
                if (folder.match(/\.xcodeproj$/)) {
                    projFolder = path.join(iosFolder, folder);
                    projName = path.basename(folder, '.xcodeproj');
                }
            });
        }

        if (!projFolder || !projName) {
            throw new Error("Could not find an .xcodeproj folder in: " + iosFolder);
        }

        run();

    });

    return deferral.promise;
};