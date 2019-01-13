class RpService {
  constructor(launchFinishTimeout = 5000) {
    this.launchFinishTimeout = launchFinishTimeout;
  }

  async onComplete(exitCode, config) {
    const reporters = config.reporters.filter((reporter) => reporter.reporterName === "reportportal");
    if (reporters.length === 0) {
      return;
    }
    const isLaunchFinished = await reporters[0].waitLaunchFinished(this.launchFinishTimeout);
    if (!isLaunchFinished) {
      // tslint:disable-next-line no-console
      console.warn("Launch has not been finished");
    }
  }
}

module.exports = RpService;
