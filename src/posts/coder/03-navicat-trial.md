# Navicat 15/16/17 在 MacOS 无限试用

各类破解版 Navicat 坑太多，要么崩溃，要么记不住密码，还不确定是否安全，分享下 Mac 下直接用官方版试用的脚本：

```sh
#!/bin/bash

set -e

file=$(defaults read /Applications/Navicat\ Premium.app/Contents/Info.plist)

regex="CFBundleShortVersionString = \"([^\.]+)"
[[ $file =~ $regex ]]

version=${BASH_REMATCH[1]}

echo "Detected Navicat Premium version $version"

case $version in
    "17")
        file=~/Library/Preferences/com.navicat.NavicatPremium.plist
        ;;
    "16")
        file=~/Library/Preferences/com.navicat.NavicatPremium.plist
        ;;
    "15")
        file=~/Library/Preferences/com.prect.NavicatPremium15.plist
        ;;
    *)
        echo "Version '$version' not handled"
        exit 1
        ;;
esac

echo -n "Reseting trial time..."

regex="([0-9A-Z]{32}) = "
[[ $(defaults read $file) =~ $regex ]]

hash=${BASH_REMATCH[1]}

if [ ! -z $hash ]; then
    defaults delete $file $hash
fi

regex="\.([0-9A-Z]{32})"
[[ $(ls -a ~/Library/Application\ Support/PremiumSoft\ CyberTech/Navicat\ CC/Navicat\ Premium/ | grep '^\.') =~ $regex ]]

hash2=${BASH_REMATCH[1]}

if [ ! -z $hash2 ]; then
    rm ~/Library/Application\ Support/PremiumSoft\ CyberTech/Navicat\ CC/Navicat\ Premium/.$hash2
fi

echo " Done"
```

直接[官网下载](https://navicat.com/en/download/navicat-premium)，打开选试用，到期后，运行一次脚本即可重新试用，官方正版，稳定可靠。
