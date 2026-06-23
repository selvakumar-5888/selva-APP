import { ExcelReporter } from './services/excel-reporter';

let reporter: ExcelReporter;

export const config: WebdriverIO.Config = {
    runner: 'local',
    port: 4723, // Default Appium port

    specs: [
        './specs/mobile/**/*.ts'
    ],
    exclude: [],
    maxInstances: 1,
    capabilities: [{
        maxInstances: 1,
        platformName: 'Android',
        'appium:deviceName': 'Android Emulator',
        'appium:automationName': 'UiAutomator2',
        // Update this path to the generated Capacitor APK
        'appium:app': '../frontend/android/app/build/outputs/apk/debug/app-debug.apk',
        'appium:autoGrantPermissions': true,
        'appium:newCommandTimeout': 240
    } as WebdriverIO.Capabilities],
    logLevel: 'info',
    bail: 0,
    waitforTimeout: 15000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,
    services: ['appium'],
    framework: 'mocha',
    reporters: ['spec'],
    mochaOpts: {
        ui: 'bdd',
        timeout: 90000
    },

    onPrepare: function (config, capabilities) {
        console.log('Starting Appium Android Tests...');
    },
    beforeSession: function () {
        reporter = new ExcelReporter({ platform: 'Mobile_Appium' });
    },
    afterTest: function (test, context, { error, result, duration, passed, retries }) {
        reporter.addResult(test.title, passed ? 'pass' : 'fail', duration);
    },
    afterSession: async function () {
        await reporter.generateReport();
    }
}
