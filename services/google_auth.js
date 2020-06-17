const {google} = require('googleapis');

const createAuthCredential = async () => {
  try {
    let authClient = await google.auth.getApplicationDefault();
    authClient = authClient.credential;

    if (authClient.createScopedRequired && authClient.createScopedRequired()) {
      authClient = authClient.createScoped([
        'https://www.googleapis.com/auth/jobs',
      ]);
    }

    return google.jobs({
      version: 'v3',
      auth: authClient,
    });
  } catch (e) {
    return console.error(e);
  }
};

module.exports = createAuthCredential;