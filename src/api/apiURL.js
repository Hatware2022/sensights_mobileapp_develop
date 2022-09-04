const DEV = 'https://dev01.sensights.ai:8080';
const STAGE = 'https://stage01.sensights.ai:8080';
const PROD = 'https://login.sensights.ai:8080';

// export const API_URL = DEV;
// export const API_URL = STAGE;
export const API_URL = PROD;

export const externalInviteUrl = (pinCode) => {
    const PRODUCTION_INIVITE_URL = `https://login.sensights.ai/meeting/external/${pinCode}`
    const STAGE_INVITE_URL = `https://stage01.sensights.ai/meeting/external/${pinCode}`
    if (API_URL == PROD)
        return PRODUCTION_INIVITE_URL
    else
        return STAGE_INVITE_URL
}
