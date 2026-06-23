import { ExcelReporter } from './services/excel-reporter';

let reporter: ExcelReporter;

export const config = {
    runner: 'local',

    specs: [
        './specs/web/**/*.ts'
    ],
    exclude: [],
    maxInstances: 1,
    capabilities: [{
        maxInstances: 1,
        browserName: 'chrome',
        acceptInsecureCerts: true,
        'goog:chromeOptions': {
            args: ['--headless', '--disable-gpu', '--window-size=1920,1080']
        }
    } as WebdriverIO.Capabilities],
    logLevel: 'info',
    bail: 0,
    baseUrl: 'http://localhost:5173',
    waitforTimeout: 10000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,
    framework: 'mocha',
    reporters: ['spec'],
    mochaOpts: {
        ui: 'bdd',
        timeout: 60000
    },

    onPrepare: function (config, capabilities) {
        console.log('Starting Selenium Web Tests...');
    },
    beforeSession: function () {
        reporter = new ExcelReporter({ platform: 'Web_Selenium' });
    },
    afterTest: function (test, context, { error, result, duration, passed, retries }) {
        reporter.addResult(test.title, passed ? 'pass' : 'fail', duration);
    },
    afterSession: async function () {
        await reporter.generateReport();
    }
}
