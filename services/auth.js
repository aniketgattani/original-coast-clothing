
// Imports the Google APIs client library
const {google} = require('googleapis');

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT;

// Acquires credentials
google.auth.getApplicationDefault((err, authClient) => {
  if (err) {
    console.error('Failed to acquire credentials');
    console.error(err);
    return;
  }

  if (authClient.createScopedRequired && authClient.createScopedRequired()) {
    authClient = authClient.createScoped([
      'https://www.googleapis.com/auth/jobs',
    ]);
  }

  // Instantiates an authorized client
  const jobServiceClient = google.jobs({
    version: 'v3',
    auth: authClient,
  });

  const request = {
    parent: `projects/${PROJECT_ID}`,
  };

  // Lists companies
  jobServiceClient.projects.companies.list(request, (err, result) => {
    if (err) {
      console.error(err);
      throw err;
    }

    console.log(`Request ID: ${result.data.metadata.requestId}`);

    const companies = result.data.companies || [];

    if (companies.length) {
      console.log('Companies:');
      companies.forEach((company) => console.log(company.name));
    } else {
      console.log(`No companies found.`);
    }
  });
});