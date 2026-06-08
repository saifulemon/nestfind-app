export default () => ({
    authJwtSecret: process.env.JWT_SECRET,
    authTokenCookieName: 'access_token',
    authTokenExpiredTime: 48 * 60 * 60,
    authRefreshTokenExpiredTime: 168 * 60 * 60,
    cookieDomain: process.env.COOKIE_DOMAIN || '',
});
