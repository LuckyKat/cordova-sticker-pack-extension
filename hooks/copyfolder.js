var fs = require('fs');
var path = require('path');
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
    var iosFolder = context.opts.cordova.project ? context.opts.cordova.project.root : path.join(context.opts.projectRoot, 'platforms/ios/');
    fs.readdir(iosFolder, function (err, data) {
        var projFolder;
        var projName;
        var srcFolder = path.join(context.opts.projectRoot, 'www', projName + ' Stickers/');
        if (!fs.existsSync(srcFolder)) {
            throw new Error('Missing stickers asset folder. Should be named "/<PROJECTNAME> Stickers/"');
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

        // copy stickers folder
        copyFolderRecursiveSync(
            srcFolder,
            path.join(context.opts.projectRoot, 'platforms', 'ios')
        );
    });
};