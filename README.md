WDIO Report Portal Reporter service for WebdriverIO v5. 
====================

For v4 version see [this branch](https://github.com/BorisOsipov/wdio-reportportal-service/tree/wdio_v4)

## Installation
The easiest way is to keep `wdio-reportportal-service` as a devDependency in your `package.json`.
```json
{
  "devDependencies": {
    "wdio-reportportal-service": "5.0.0"
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

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
