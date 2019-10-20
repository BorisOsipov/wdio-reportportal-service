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
    RpService.getReportPortalClient = () => {return {startLaunch: startLaunchMock}};
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

describe("#onPrepare reportportal v5", () => {
  let service;
  let startLaunchMock;

  beforeEach(() => {
    startLaunchMock = jest.fn().mockReturnValue({
      promise: Promise.resolve({id: 'foo', uuid: START_LAUNCH_REAL_ID}),
      tempId: START_LAUNCH_TEMP_ID,
    });
    service = new RpService();
    RpService.getReportPortalClient = () => {
      return {startLaunch: startLaunchMock}
    };
  });

  test("should expose RP_LAUNCH_ID", async () => {
    await service.onPrepare(getWdioConfig());
    expect(process.env.RP_LAUNCH_ID).toEqual(START_LAUNCH_REAL_ID)
  });

});

describe("#onComplete", () => {
  let service;
  let finishLaunchMock;
  let startLaunchMock;

  beforeEach(() => {
    finishLaunchMock = jest.fn().mockReturnValue({
      promise: Promise.resolve("ok"),
      tempId: "foo",
    });
    startLaunchMock = jest.fn().mockReturnValue({
      promise: Promise.resolve({id: START_LAUNCH_REAL_ID}),
      tempId: START_LAUNCH_TEMP_ID,
    });
    service = new RpService();
    RpService.getReportPortalClient = () => {return {finishLaunch: finishLaunchMock, startLaunch: startLaunchMock}};
  });

  test("should finish launch", async () => {
    await service.onComplete(0, getWdioConfig());

    expect(finishLaunchMock).toBeCalledTimes(1);
    expect(finishLaunchMock).toBeCalledWith(START_LAUNCH_TEMP_ID, {});
  });

  test("should handle finish launch error", async () => {
    finishLaunchMock = jest.fn().mockReturnValue({
      promise: Promise.reject("boom"),
      tempId: "foo",
    });

    jest.spyOn(console, 'error').mockImplementation((string) => string);

    await service.onComplete(0, getWdioConfig());
    expect(finishLaunchMock).toBeCalledTimes(1);
    expect(finishLaunchMock).toBeCalledWith(START_LAUNCH_TEMP_ID, {});
    expect(console.error).toHaveBeenCalledWith('boom')
  });

  test("should handle finish launch noy allowed to finish error", async () => {
    finishLaunchMock = jest.fn().mockReturnValue({
      promise: Promise.reject(Error("Finish launch is not allowed foo bar")),
      tempId: "foo",
    });

    jest.spyOn(console, 'warn').mockImplementation((string) => string);

    await service.onComplete(0, getWdioConfig());
    expect(finishLaunchMock).toBeCalledTimes(1);
    expect(finishLaunchMock).toBeCalledWith(START_LAUNCH_TEMP_ID, {});
    expect(console.warn).toBeCalledTimes(2)
    expect(console.warn).toHaveBeenCalledWith("Can't finish Report portal launch due errors");
    expect(console.warn).toHaveBeenCalledWith("Finish launch is not allowed foo bar");
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

describe("#getRpVersion", () => {
  test("should return v5 version", async () => {
    const getPlugins = jest.fn().mockReturnValue(Promise.resolve({foo: "bar"}));
    expect(await RpService.getRpVersion({getPlugins})).toEqual(5)
  });

  test("should return v4 version", async () => {
    const getPlugins = jest.fn().mockReturnValue(Promise.reject({foo: "bar"}));
    expect(await RpService.getRpVersion({getPlugins})).toEqual(4)
  });
});
