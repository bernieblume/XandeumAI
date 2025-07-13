// pages/api/config.js
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload = {
      appTitle: process.env.APP_TITLE || 'Xandeum AI',
      serverDomain: process.env.DOMAIN_SERVER || 'https://xandeum.ai',
      emailLoginEnabled: true,
      registrationEnabled: true,
      socialLoginEnabled: false,
      passwordResetEnabled: false,
      helpAndFaqURL: 'https://xandeum.ai',
      sharedLinksEnabled: false,
      publicSharedLinksEnabled: false,
      showBirthdayIcon: false,
      instanceProjectId: 'default-project-id'
    };

    return res.status(200).json(payload);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
