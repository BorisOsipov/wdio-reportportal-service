const ReportPortalClient = require("reportportal-js-client");

class RpService {
  async onPrepare(config, capabilities) {
    const reportPortalClientConfig = RpService.getRpReporterConfig(config);
    if (reportPortalClientConfig === null) {
      return;
    }
    const client = this.getReportPortalClient(reportPortalClientConfig);

    const {description, mode, tags } = reportPortalClientConfig;
    const {promise, tempId} = client.startLaunch({description, mode, tags});

    this.tempLaunchId = tempId;
    const {id} = await promise;
    process.env.RP_LAUNCH_ID = id;
    return promise;
  }

  async onComplete(exitCode, config) {
    const reportPortalClientConfig = RpService.getRpReporterConfig(config);
    if (reportPortalClientConfig === null) {
      return;
    }
    const client = this.getReportPortalClient(reportPortalClientConfig);
    const {promise: finishLaunchPromise} = client.finishLaunch(this.tempLaunchId, {});
    return finishLaunchPromise;
  }

  static getRpReporterConfig(config) {
    const reporters = config.reporters.filter(([reporter]) => reporter.reporterName === "reportportal");
    if (reporters.length === 0) {
      return null;
    }
    const [, reporterConfig] = reporters[0];
    const {reportPortalClientConfig} = reporterConfig;
    return reportPortalClientConfig
  }

  getReportPortalClient(reportPortalClientConfig) {
    return this.client ? this.client : new ReportPortalClient(reportPortalClientConfig);
  }

}

module.exports = RpService;
