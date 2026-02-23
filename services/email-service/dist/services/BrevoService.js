"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrevoService = void 0;
class BrevoService {
    static config = {
        apiKey: process.env.BREVO_API_KEY || 'dummy_api_key',
        baseUrl: 'https://api.brevo.com/v3/smtp/email',
    };
    static async sendEmail(to, subject, textContent) {
        try {
            const response = await fetch(this.config.baseUrl, {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'api-key': this.config.apiKey,
                    'content-type': 'application/json',
                },
                body: JSON.stringify({
                    sender: { email: 'noreply@ihsolution.tech', name: 'SaaS CRM' },
                    to: [{ email: to }],
                    subject,
                    textContent,
                }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Brevo API Error:', errorData);
                return false;
            }
            console.log(`Email successfully sent to ${to}`);
            return true;
        }
        catch (error) {
            console.error('Failed to send email via Brevo:', error);
            return false;
        }
    }
}
exports.BrevoService = BrevoService;
