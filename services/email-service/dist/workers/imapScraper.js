"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startImapCron = void 0;
const startImapCron = () => {
    const POLLING_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
    console.log('Initializing IMAP Scraper Cron Job...');
    setInterval(() => {
        console.log(`[${new Date().toISOString()}] Cron triggered: Scanning all active ImapSettings across tenant databases for new emails...`);
        // Note: Heavy node-imap stream logic will be implemented here later.
    }, POLLING_INTERVAL_MS);
};
exports.startImapCron = startImapCron;
