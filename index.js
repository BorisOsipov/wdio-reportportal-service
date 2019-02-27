const ReportPortalClient = require("reportportal-client");

export class RpService {

  async onPrepare(exitCode, config) {
    const reporters = config.reporters.filter(([reporter]) => reporter.reporterName === "reportportal");
    if (reporters.length === 0) {
      //TODO throw error?
      return;
    }
    const [, reporterConfig] = reporters[0];
    const {reportPortalClientConfig} = reporterConfig;
    this.client = new ReportPortalClient(reportPortalClientConfig);

    const startLaunchObj = {
      description: reportPortalClientConfig.description,
      mode: reportPortalClientConfig.mode,
      tags: reportPortalClientConfig.tags,
    };
    const {promise, tempId} = this.client.startLaunch(startLaunchObj);

    this.tempLaunchId = tempId;
    const {id} = await promise;
    process.env.RP_LAUNCH_ID = id;
  }

  async onComplete(exitCode, config) {
    const reporters = config.reporters.filter(([reporter]) => reporter.reporterName === "reportportal");
    if (reporters.length === 0) {
      //TODO throw error?
      return;
    }

    const {promise: finishLaunchPromise} = this.client.finishLaunch(this.tempLaunchId, {});
    await finishLaunchPromise;
  }
}
