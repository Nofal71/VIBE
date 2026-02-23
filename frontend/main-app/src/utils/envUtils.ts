





const hostname = window.location.hostname;




export const getBaseDomain = (): string =>
    hostname.endsWith('.localhost') || hostname === 'localhost' || hostname === '127.0.0.1'
        ? 'localhost'
        : 'ihsolution.tech';




export const getProtocol = (): 'http' | 'https' =>
    getBaseDomain() === 'localhost' ? 'http' : 'https';




export const getApiGateway = (): string =>
    `${getProtocol()}://api.${getBaseDomain()}`;




export const getTenantUrl = (subdomain: string): string =>
    `${getProtocol()}://${subdomain}.${getBaseDomain()}`;




export const getWebFormGateway = (): string =>
    `${getApiGateway()}/core`;




export const isLocalEnv = (): boolean => getBaseDomain() === 'localhost';


export const isProductionEnv = (): boolean => getBaseDomain() === 'ihsolution.tech';
