WDIO Report Portal Reporter service
====================

## Installation
The easiest way is to keep `wdio-reportportal-service` as a devDependency in your `package.json`.
```json
{
  "devDependencies": {
    "wdio-reportportal-service": "~0.0.1"
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
const Index = require('wdio-reportportal-service');

// Service will wait max 3000 ms till launch finishes on RP server
const rpService = new Index(3000);

exports.config = {
  // ...
  services: [rpService],
  // ...
}
```

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
