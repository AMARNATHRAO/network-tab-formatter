const fs = require('fs');
const { get } = require('lodash');
const xlsx = require('node-xlsx');

getSheetData = (file) => {
    const data = fs.readFileSync(`./LoadingTimeHARFiles/${file}`, 'utf8');
    if (!data) {
        return [];
    }
    const jsonData = JSON.parse(data);
    const log = get(jsonData, 'log', {});
    const { browser, pages, entries } = log;

    const browserName = get(browser, 'name');
    const browserVersion = get(browser, 'version');

    const pageTitle = get(pages, '[0].title');
    const pageOnContentLoad = get(pages, '[0].pageTimings.onContentLoad');
    const pageOnLoad = get(pages, '[0].pageTimings.onLoad');

    const contentArr = entries.map((entry) => {
        const method = get(entry, 'request.method');
        const url = get(entry, 'request.url');
        const httpVersion = get(entry, 'request.httpVersion');
        const mimeType = get(entry, 'response.content.mimeType');
        const originalSize = get(entry, 'response.content.size');
        const transfferedSize = get(entry, 'response.bodySize');
        const blockedTime = get(entry, 'timings.blocked');
        const dnsTime = get(entry, 'timings.dns');
        const connectTime = get(entry, 'timings.connect');
        const sslTime = get(entry, 'timings.ssl');
        const sendTime = get(entry, 'timings.send');
        const waitTime = get(entry, 'timings.wait');
        const receiveTime = get(entry, 'timings.receive');
        const totalTime = get(entry, 'time');
        return [
            url,
            method,
            httpVersion,
            mimeType,
            originalSize,
            transfferedSize,
            blockedTime,
            dnsTime,
            connectTime,
            sslTime,
            sendTime,
            waitTime,
            receiveTime,
            totalTime,
        ];
    });

    return [
        ['Browser Name', browserName],
        ['Browser Version', browserVersion],
        ['Page Title', pageTitle],
        ['Page On Content Load', pageOnContentLoad],
        ['Page On Load', pageOnLoad],
        [
            'URL',
            'Method',
            'Http Version',
            'Mime Type',
            'Original Size',
            'Transffered Size',
            'Blocked Time',
            'Dns Time',
            'Connect Time',
            'SSL Time',
            'Send Time',
            'Wait Time',
            'Receive Time',
            'Total Time',
        ],
        ...contentArr,
    ];
};

try {
    const dirFiles = fs.readdirSync('./LoadingTimeHARFiles');

    const buildObj = dirFiles.map((file) => {
        return {
            name: file.slice(0, 30),
            data: getSheetData(file),
        };
    });

    const buffer = xlsx.build(buildObj); // Returns a buffer

    const fileName = new Date()
        .toLocaleString()
        .replace(/ /g, '')
        .replace(/,/g, '-')
        .replace(/\//g, '-')
        .replace(/:/g, '-');

    fs.writeFileSync(`awam-network-tab-stats-${fileName}.xlsx`, buffer);
    console.log('Process Completed');
    return;
} catch (err) {
    console.error(err);
}
