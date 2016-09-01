# Cordova Stickers Extension Plugin

The latest iPhone firmware iOS 10 (as of writing, still in beta) has new iMessage functions which includes Sticker Packs. See [https://developer.apple.com/imessage/](https://developer.apple.com/imessage/). Stickers come in the form of standalone Sticker Pack App, but also as an Extension to your existing app. 

This plugin adds an iMessage Stickers App Extension to your existing Cordova/Cocoon.io project.
XCode 8 is required (as of writing, also still in beta).

## How to use

1. First, prepare a sticker pack (see below).
2. Install the plugin by 

```$ cordova plugin add https://github.com/LuckyKat/cordova-imessage-stickers```

Or if using Cocoon.io, add the plugin by Plugins -> Custom -> Git url.
The Sticker Pack will be copied from the www folder during the plugin install.

3. Compile the project with XCode 8.

## Preparing a sticker pack

The easiest way to do this is by installing XCode 8 and creating a Sticker App Extension. The resulting .xcassets and Info.plist can then be used as Sticker Pack for the Cordova project. You could also do this by hand if you know which json files to create.

Place the .xcasset and Info.plist in a folder named ``YOUR_PROJECT_NAME Stickers`` and place this in the www folder. 

The bundle id of the sticker pack will be ``YOUR.BUNDLE.ID.YOUR_PROJECT_NAME-Stickers``. For example a project named Nom Cat with the bundle id com.luckykat.nomcat should have a sticker pack folder ``Nom Cat Stickers`` and will receive the bundle id ``com.luckykat.nomcat.Nom-Cat-Stickers``.
