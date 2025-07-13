// api/config.js
import { CacheKeys, defaultSocialLogins, Constants } from 'librechat-data-provider';
import { getLdapConfig } from '../api/server/services/Config/ldap';
import { getProjectByName } from '../api/models/Project';
import { isEnabled } from '../api/server/utils';
import { getLogStores } from '../api/cache';
import { logger } from '../api/config';

const emailLoginEnabled =
  process.env.ALLOW_EMAIL_LOGIN === undefined || isEnabled(process.env.ALLOW_EMAIL_LOGIN);
const passwordResetEnabled = isEnabled(process.env.ALLOW_PASSWORD_RESET);

const sharedLinksEnabled =
  process.env.ALLOW_SHARED_LINKS === undefined || isEnabled(process.env.ALLOW_SHARED_LINKS);

const publicSharedLinksEnabled =
  sharedLinksEnabled &&
  (process.env.ALLOW_SHARED_LINKS_PUBLIC === undefined ||
    isEnabled(process.env.ALLOW_SHARED_LINKS_PUBLIC));

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const cache = getLogStores(CacheKeys.CONFIG_STORE);
    const cachedStartupConfig = await cache.get(CacheKeys.STARTUP_CONFIG);
    if (cachedStartupConfig) {
      return res.status(200).json(cachedStartupConfig);
    }

    const isBirthday = () => {
      const today = new Date();
      return today.getMonth() === 1 && today.getDate() === 11;
    };

    const instanceProject = await getProjectByName(Constants.GLOBAL_PROJECT_NAME, '_id');
    const ldap = getLdapConfig();

    const payload = {
      appTitle: process.env.APP_TITLE || 'Xandeum AI',
      socialLogins: defaultSocialLogins,
      discordLoginEnabled: !!process.env.DISCORD_CLIENT_ID && !!process.env.DISCORD_CLIENT_SECRET,
      facebookLoginEnabled: !!process.env.FACEBOOK_CLIENT_ID && !!process.env.FACEBOOK_CLIENT_SECRET,
      githubLoginEnabled: !!process.env.GITHUB_CLIENT_ID && !!process.env.GITHUB_CLIENT_SECRET,
      googleLoginEnabled: !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET,
      appleLoginEnabled: !!process.env.APPLE_CLIENT_ID && !!process.env.APPLE_TEAM_ID && !!process.env.APPLE_KEY_ID && !!process.env.APPLE_PRIVATE_KEY_PATH,
      openidLoginEnabled: !!process.env.OPENID_CLIENT_ID && !!process.env.OPENID_CLIENT_SECRET && !!process.env.OPENID_ISSUER && !!process.env.OPENID_SESSION_SECRET,
      openidLabel: process.env.OPENID_BUTTON_LABEL || 'Continue with OpenID',
      openidImageUrl: process.env.OPENID_IMAGE_URL,
      openidAutoRedirect: isEnabled(process.env.OPENID_AUTO_REDIRECT),
      serverDomain: process.env.DOMAIN_SERVER || 'https://xandeum.ai',
      emailLoginEnabled,
      registrationEnabled: !ldap?.enabled && isEnabled(process.env.ALLOW_REGISTRATION),
      socialLoginEnabled: isEnabled(process.env.ALLOW_SOCIAL_LOGIN),
      emailEnabled: (!!process.env.EMAIL_SERVICE || !!process.env.EMAIL_HOST) && !!process.env.EMAIL_USERNAME && !!process.env.EMAIL_PASSWORD && !!process.env.EMAIL_FROM,
      passwordResetEnabled,
      showBirthdayIcon: isBirthday() || isEnabled(process.env.SHOW_BIRTHDAY_ICON) || process.env.SHOW_BIRTHDAY_ICON === '',
      helpAndFaqURL: process.env.HELP_AND_FAQ_URL || 'https://xandeum.ai',
      sharedLinksEnabled,
      publicSharedLinksEnabled,
      analyticsGtmId: process.env.ANALYTICS_GTM_ID,
      instanceProjectId: instanceProject?._id?.toString(),
      bundlerURL: process.env.SANDPACK_BUNDLER_URL,
      staticBundlerURL: process.env.SANDPACK_STATIC_BUNDLER_URL,
    };

    if (ldap) {
      payload.ldap = ldap;
    }

    if (typeof process.env.CUSTOM_FOOTER === 'string') {
      payload.customFooter = process.env.CUSTOM_FOOTER;
    }

    await cache.set(CacheKeys.STARTUP_CONFIG, payload);
    return res.status(200).json(payload);
  } catch (err) {
    logger.error('Error in startup config', err);
    return res.status(500).json({ error: err.message });
  }
}
