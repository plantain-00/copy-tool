[![Dependency Status](https://david-dm.org/plantain-00/copy-tool.svg)](https://david-dm.org/plantain-00/copy-tool)
[![devDependency Status](https://david-dm.org/plantain-00/copy-tool/dev-status.svg)](https://david-dm.org/plantain-00/copy-tool#info=devDependencies)
[![Build Status](https://travis-ci.org/plantain-00/copy-tool.svg?branch=master)](https://travis-ci.org/plantain-00/copy-tool)

# copy-tool
A tool to copy text or file from one place, and get it from another place

#### features

+ multiple clients connect to same url, when one client send message, the others will get it.
+ the message can be text or file.
+ support PC and mobile browser.

#### deploy

+ git clone the `release` branch of this repository
+ run `node index.js` to start, open `http://localhost:8000`
+ (optional) run `node index.js -h 0.0.0.0 -p 9000` to let the server listen to `http://0.0.0.0:9000`
