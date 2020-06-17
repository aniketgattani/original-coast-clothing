const {google} = require('googleapis');

const createAuthCredential = async () => {
  try {
    let authClient = await google.auth.getApplicationDefault();
    authClient = authClient.credential;

    //if (authClient.createScopedRequired && authClient.createScopedRequired()) {
      authClient = authClient.createScoped([
        'https://www.googleapis.com/auth/jobs',
      ]);
      //console.log("wsdvsdvsdv");
    //}

    var jobServiceClient = google.jobs({
      version: 'v3',
      auth: authClient,
    });
    //console.log(jobServiceClient.projects.companies.context);
    return jobServiceClient;

  } catch (e) {
    return console.error(e);
  }
};

module.exports = createAuthCredential;