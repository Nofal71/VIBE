import { Sequelize, QueryTypes } from 'sequelize';
import { User } from '../models/User';

let masterSeq: Sequelize | null = null;

export const setMasterSequelize = (seq: Sequelize) => {
    masterSeq = seq;
};

export const getMasterSequelize = (): Sequelize => {
    if (!masterSeq) throw new Error('Master Sequelize not initialized.');
    return masterSeq;
};

export const resolveDbNameFromTenantId = async (tenantId: string): Promise<string | null> => {
    if (tenantId === 'public') return 'saas_master_db';

    const db = getMasterSequelize();

    // We expect the tenantId to be the domain_name (e.g. demo.localhost)
    // The master database stores domain_name -> company_id -> db_name
    const result = await db.query<any>(
        `SELECT c.db_name 
         FROM domains d
         JOIN companies c ON d.company_id = c.id
         WHERE d.domain_name = :domainName
         LIMIT 1`,
        {
            replacements: { domainName: tenantId },
            type: QueryTypes.SELECT
        }
    );

    if (result && result.length > 0) {
        return result[0].db_name;
    }
    return null;
};
