export default () => {
    if (!process.env.AUTH_JWT_SECRET) {
        console.error('[jwt.config] Missing AUTH_JWT_SECRET env var. Available auth/jwt keys:',
            Object.keys(process.env).filter(k => k.includes('AUTH') || k.includes('JWT')));
        throw new Error('AUTH_JWT_SECRET environment variable is required');
    }
    return {
        authJwtSecret: process.env.AUTH_JWT_SECRET,
        authTokenCookieName: process.env.AUTH_TOKEN_COOKIE_NAME || 'access_token',
        authTokenExpiredTime: 48 * 60 * 60,
        authRefreshTokenExpiredTime: 168 * 60 * 60,
        cookieDomain: process.env.COOKIE_DOMAIN || '',
    };
};
