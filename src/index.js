const ReportPortalClient = require("reportportal-js-client");

class RpService {
  async onPrepare(config, capabilities) {
    const reporters = this.getRpReporters(config);
    if (reporters.length === 0) {
      return;
    }

    const [, reporterConfig] = reporters[0];
    const {reportPortalClientConfig} = reporterConfig;
    this.client = new ReportPortalClient(reportPortalClientConfig);

    const {description, mode, tags } = reportPortalClientConfig;
    const {promise, tempId} = this.client.startLaunch({description, mode, tags});

    this.tempLaunchId = tempId;
    const {id} = await promise;
    process.env.RP_LAUNCH_ID = id;
  }

  async onComplete(exitCode, config) {
    const reporters = this.getRpReporters(config);
    if (reporters.length === 0) {
      return;
    }

    const {promise: finishLaunchPromise} = this.client.finishLaunch(this.tempLaunchId, {});
    await finishLaunchPromise;
  }

  getRpReporters(config) {
    return config.reporters.filter(([reporter]) => reporter.reporterName === "reportportal");
  }
}

module.exports = RpService;
