WDIO Report Portal Reporter service for WebdriverIO v5.
====================

For WebdriverIO v4 version see [this branch](https://github.com/BorisOsipov/wdio-reportportal-service/tree/wdio_v4)
For Report Portal v4 support use `5.X.X` versions.

## Installation
The easiest way is to keep `wdio-reportportal-service` as a devDependency in your `package.json`.
```json
{
  "devDependencies": {
    "wdio-reportportal-service": "6.1.0"
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
