// pages/api/config.js
module.exports = (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Completely static response - no file system operations
  const payload = {
    appTitle: 'Xandeum AI',
    serverDomain: 'https://xandeum.ai',
    emailLoginEnabled: true,
    registrationEnabled: true,
    socialLoginEnabled: false,
    passwordResetEnabled: false,
    helpAndFaqURL: 'https://xandeum.ai',
    sharedLinksEnabled: false,
    publicSharedLinksEnabled: false,
    showBirthdayIcon: false,
    instanceProjectId: 'xandeum-default',
    // Mock the expected LibreChat config structure
    socialLogins: [],
    discordLoginEnabled: false,
    facebookLoginEnabled: false,
    githubLoginEnabled: false,
    googleLoginEnabled: false,
    appleLoginEnabled: false,
    openidLoginEnabled: false
  };

  res.status(200).json(payload);
};
