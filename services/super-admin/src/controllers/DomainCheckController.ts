import { Request, Response } from 'express';
import { Domain, Company } from '../models';

export class DomainCheckController {
    static async check(req: Request, res: Response): Promise<void> {
        try {
            const domainName = req.query.domain as string;

            if (!domainName) {
                res.status(400).send('Bad Request');
                return;
            }

            
            const SYSTEM_SUBDOMAINS = new Set(['www.ihsolution.tech', 'ihsolution.tech', 'api.ihsolution.tech']);
            if (SYSTEM_SUBDOMAINS.has(domainName)) {
                res.status(200).send('OK');
                return;
            }

            const domain = await Domain.findOne({
                where: { domain_name: domainName },
                include: [{
                    model: Company,
                    as: 'company',
                    where: { status: 'active' }
                }]
            });

            if (domain && domain.company) {
                
                res.status(200).send('OK');
            } else {
                
                res.status(404).send('Not Found');
            }

        } catch (error) {
            console.error('Domain check error:', error);
            res.status(500).send('Internal Server Error');
        }
    }
}
