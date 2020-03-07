const ReportPortalClient = require("reportportal-js-client");

class RpService {
  async onPrepare(config) {
    const launchId = process.env.REPORT_PORTAL_LAUNCH_ID;
    if (launchId) {
      process.env.RP_LAUNCH_ID = launchId;
      return
    }

    const reportPortalClientConfig = RpService.getRpReporterConfig(config);
    if (reportPortalClientConfig === null) {
      return;
    }
    const client = RpService.getReportPortalClient(reportPortalClientConfig);

    const {description, mode, attributes} = reportPortalClientConfig;
    const {promise} = client.startLaunch({description, mode, attributes});

    const {id} = await promise;
    process.env.RP_LAUNCH_ID = id;
    return promise;
  }

  async onComplete(exitCode, config) {
    if (process.env.REPORT_PORTAL_LAUNCH_ID) {
      return
    }
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

  /**
   * Generate url to Report Portal UI for current launch
   * @param {object} config - wdio config
   * @return {Promise<string|undefined>} - returns url to launch or undefined if error
   */
  static async getLaunchUrl(config) {
    const rpConfig = RpService.getRpReporterConfig(config);
    if (rpConfig === null) {
      return;
    }

    const {endpoint} = rpConfig;
    const {hostname, protocol, port} = new URL(endpoint);

    let portString = "";
    if (port) {
      portString = `:${port}`
    }

    return await this.getLaunchUrlByParams(protocol, hostname, portString, rpConfig);
  }

  /**
   * Generate url to Report Portal UI for current launch
   * @param {string} protocol - server url protocol (http|https)
   * @param {string} hostname - report portal host e.g. "rp.example.com"
   * @param {string} port - server port or empty if used default 80|433. Format example ":80"
   * @param {object} config - wdio config
   * @return {Promise<string>}  - returns url to launch or undefined if error
   */
  static async getLaunchUrlByParams(protocol, hostname, port, config) {
    const realLaunchId = process.env.RP_LAUNCH_ID;
    const {project} = config;
    const client = RpService.getReportPortalClient(config);
    try {
      const {id} = await client.getLaunchByUid(realLaunchId);
      return `${protocol}//${hostname}${port}/ui/#${project}/launches/all/${id}`
    } catch (e) {
      console.error("Can't generate report portal launch url");
      console.error(e)
    }
  }
}

module.exports = RpService;
