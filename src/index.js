const ReportPortalClient = require("reportportal-js-client");

let RP_VERSION_5 = 5;
let RP_VERSION_4 = 4;

class RpService {
  async onPrepare(config) {
    const reportPortalClientConfig = RpService.getRpReporterConfig(config);
    if (reportPortalClientConfig === null) {
      return;
    }
    const client = RpService.getReportPortalClient(reportPortalClientConfig);

    const {description, mode, tags} = reportPortalClientConfig;
    const {promise} = client.startLaunch({description, mode, tags});

    const {uuid, id} = await promise;
    process.env.RP_LAUNCH_ID = uuid || id;
    return promise;
  }

  async onComplete(exitCode, config) {
    const reportPortalClientConfig = RpService.getRpReporterConfig(config);
    if (reportPortalClientConfig === null) {
      return;
    }
    const client = RpService.getReportPortalClient(reportPortalClientConfig);
    const realLaunchId = process.env.RP_LAUNCH_ID;
    const {tempId} = client.startLaunch({id: realLaunchId});
    const {promise: finishLaunchPromise} = client.finishLaunch(tempId, {});

    try {
      await finishLaunchPromise
    } catch (err) {
      if (err.message && err.message.includes("Finish launch is not allowed")) {
        console.warn("Can't finish Report portal launch due errors");
        console.warn(err.message);
      } else {
        console.error(err)
      }
    }
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

  static getReportPortalClient(reportPortalClientConfig) {
    return new ReportPortalClient(reportPortalClientConfig);
  }

  static async getLaunchUrl(config) {
    const reportPortalClientConfig = RpService.getRpReporterConfig(config);
    if (reportPortalClientConfig === null) {
      return;
    }

    const client = RpService.getReportPortalClient(reportPortalClientConfig);
    const realLaunchId = process.env.RP_LAUNCH_ID;
    const rpVersion = await RpService.getRpVersion(client);

    const {project, endpoint} = reportPortalClientConfig;
    const {hostname} = new URL(endpoint);

    if (rpVersion === RP_VERSION_4) {
      return `https://${hostname}/ui/#${project}/launches/all/${realLaunchId}`;
    } else {
      try {
        const {id} = await client.getLaunchByUid(realLaunchId);
        return `https://${hostname}/ui/#${project}/launches/all/${id}`
      } catch (e) {
        console.error("Can't generate report portal launch url");
        console.error(e)
      }
    }
  }

  static async getRpVersion(client) {
    try {
      // plugins api available only in report portal 5+ versions
      await client.getPlugins();
      return RP_VERSION_5
    } catch (e) {
      return RP_VERSION_4
    }
  }
}

module.exports = RpService;
