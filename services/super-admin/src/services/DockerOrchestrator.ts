import fs from 'fs';
import path from 'path';

export class DockerOrchestrator {
    /**
     * Dynamically provisions the physical infrastructure folders and 
     * Docker Compose orchestration for a new Single-Tenant instance.
     */
    static async provisionTenantInfrastructure(domain: string, dbName: string): Promise<void> {
        try {
            // 1. Create isolated storage directories on the host
            const tenantRoot = path.join(__dirname, '../../../../data/tenants', domain);
            const mysqlPath = path.join(tenantRoot, 'mysql');
            const filesPath = path.join(tenantRoot, 'files');
            const deploymentsPath = path.join(__dirname, '../../../../deployments');

            fs.mkdirSync(mysqlPath, { recursive: true });
            fs.mkdirSync(filesPath, { recursive: true });
            fs.mkdirSync(deploymentsPath, { recursive: true });

            console.log(`[DockerOrchestrator] Infrastructure folders created for ${domain}`);

            // 2. Generate Tenant-Specific Docker Compose YAML
            const yamlContent = `
version: '3.8'

services:
  ${domain}-db:
    image: mysql:8
    container_name: \${DOMAIN_PREFIX:-}${domain}-db
    restart: always
    environment:
      MYSQL_DATABASE: ${dbName}
      MYSQL_ROOT_PASSWORD: \${MYSQL_ROOT_PASSWORD:-root}
    volumes:
      - ../data/tenants/${domain}/mysql:/var/lib/mysql
    networks:
      - ${domain}_network

  ${domain}-crm-core:
    image: vibe-crm-core:latest
    container_name: \${DOMAIN_PREFIX:-}${domain}-crm-core
    restart: always
    environment:
      NODE_ENV: production
      DB_NAME: ${dbName}
      DB_HOST: ${domain}-db
      DB_USER: admin
      DB_PASSWORD: \${DB_PASSWORD:-admin}
    depends_on:
      - ${domain}-db
    volumes:
      - ../data/tenants/${domain}/files:/var/crm_data
    networks:
      - ${domain}_network

networks:
  ${domain}_network:
    driver: bridge
`;

            // 3. Persist the deployment configuration
            const deploymentFile = path.join(deploymentsPath, `${domain}-compose.yml`);
            fs.writeFileSync(deploymentFile, yamlContent.trim());

            console.log(`[DockerOrchestrator] Stack orchestration file generated: ${deploymentFile}`);

        } catch (error) {
            console.error(`[DockerOrchestrator] Critical infrastructure failure for tenant ${domain}:`, error);
            throw error;
        }
    }
}
