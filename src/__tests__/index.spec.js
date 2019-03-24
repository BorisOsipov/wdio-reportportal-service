const RpService = require("../index");

const getRpConfig = () => {
  return {
    reportPortalClientConfig: {
      endpoint: "https://localhost/api/v1",
      launch: 'launch name',
      mode: 'DEFAULT',
      description: 'launch desc',
      tags: ["foo"],
      project: "project-name",
      token: "da135aa3-2c6f-4d7f-a25e-d74cbbc64af9",
      debug: false,
    },
    reportSeleniumCommands: false,
    autoAttachScreenshots: false,
    seleniumCommandsLogLevel: 'debug',
    screenshotsLogLevel: 'info',
    parseTagsFromTestTitle: true,
  };
};

const reporter = class Reporter {
};
reporter.reporterName = "reportportal";

const getWdioConfig = () => {
  return {
    reporters: ['spec', [reporter, getRpConfig()]],
  };
};

const START_LAUNCH_REAL_ID = "start launch real id";
const START_LAUNCH_TEMP_ID = "start launch temp id";

describe("#onPrepare", () => {
  let service;
  let startLaunchMock;

  beforeEach(() => {
    startLaunchMock = jest.fn().mockReturnValue({
      promise: Promise.resolve({id: START_LAUNCH_REAL_ID}),
      tempId: START_LAUNCH_TEMP_ID,
    });
    service = new RpService();
    service.client = {startLaunch: startLaunchMock};
  });

  test("should start launch", async () => {
    await service.onPrepare(getWdioConfig());

    expect(startLaunchMock).toBeCalledTimes(1);
    expect(startLaunchMock).toBeCalledWith(
      {
        description: "launch desc",
        mode: "DEFAULT",
        tags: ["foo"],
      })
  });

  test("should expose RP_LAUNCH_ID", async () => {
    await service.onPrepare(getWdioConfig());
    expect(process.env.RP_LAUNCH_ID).toEqual(START_LAUNCH_REAL_ID)
  });

  test("should save temp id", async () => {
    await service.onPrepare(getWdioConfig());
    expect(service.tempLaunchId).toEqual(START_LAUNCH_TEMP_ID)
  });

  test("should skip if empty config", async () => {
    const wdioConfig = getWdioConfig();
    wdioConfig.reporters = [];
    await service.onPrepare(wdioConfig);
    expect(startLaunchMock).toBeCalledTimes(0);
    expect(process.env.RP_LAUNCH_ID).toBeUndefined();
    expect(service.tempLaunchId).toBeUndefined();
  });

  afterEach(() => {
    delete process.env.RP_LAUNCH_ID;
  });
});

describe("#onComplete", () => {
  let service;
  let finishLaunchMock;

  beforeEach(() => {
    finishLaunchMock = jest.fn().mockReturnValue({
      promise: Promise.resolve("ok"),
      tempId: "foo",
    });
    service = new RpService();
    service.client = {finishLaunch: finishLaunchMock};
  });

  test("should finish launch", async () => {
    service.tempLaunchId = "bar";
    await service.onComplete(0, getWdioConfig());

    expect(finishLaunchMock).toBeCalledTimes(1);
    expect(finishLaunchMock).toBeCalledWith("bar", {});
  });

  test("should skip if empty config", async () => {
    const wdioConfig = getWdioConfig();
    wdioConfig.reporters = [];
    await service.onComplete(0, wdioConfig);
    expect(finishLaunchMock).toBeCalledTimes(0);
  });
});

describe("#getRpReporterConfig", () => {
  test("should return reportportal config", () => {
    expect(RpService.getRpReporterConfig(getWdioConfig())).toEqual(getRpConfig().reportPortalClientConfig);
  });

  test("should return null when reportportal isn't in reporters", () => {
    const wdioConfig = getWdioConfig();
    wdioConfig.reporters = ['dot'];
    expect(RpService.getRpReporterConfig(wdioConfig)).toBeNull();
  });
});
