WDIO Report Portal Reporter service for WebdriverIO v5. 
====================
[![Build Status](https://travis-ci.org/BorisOsipov/wdio-reportportal-service.svg?branch=master)](https://travis-ci.org/BorisOsipov/wdio-reportportal-service) [![Greenkeeper badge](https://badges.greenkeeper.io/BorisOsipov/wdio-reportportal-service.svg)](https://greenkeeper.io/)

For v4 version see [this branch](https://github.com/BorisOsipov/wdio-reportportal-service/tree/wdio_v4)

## Installation
The easiest way is to keep `wdio-reportportal-service` as a devDependency in your `package.json`.
```json
{
  "devDependencies": {
    "wdio-reportportal-service": "5.2.1"
  }
}
```
You can simple do it by:

```bash
npm install wdio-reportportal-reporter --save-dev
```

Instructions on how to install `WebdriverIO` can be found [here](http://webdriver.io/guide/getstarted/install.html).

## Configuration
Configure the output directory in your wdio.conf.js file:
```js
const RpService = require('wdio-reportportal-service');

exports.config = {
  // ...
  services: [[RpService, {}]],
  // ...
}
```

## License

This project is licensed under the MIT License - see the [LICENSE.md](https://github.com/BorisOsipov/wdio-reportportal-service/blob/master/LICENSE) file for details
