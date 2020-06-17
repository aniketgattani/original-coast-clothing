'use strict';

const createAuthCredential = require(`./google_auth`);
const createCompany = require('./create_company');

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT;

/**
 * This file contains the basic knowledge about job, including:
 *
 * - Construct a job with required fields
 *
 * - Create a job
 *
 * - Get a job
 *
 * - Update a job
 *
 * - Update a job with field mask
 *
 * - Delete a job
 */

// [START basic_job]

/**
 * Generate a basic job with given companyName.
 */
const generateJobWithRequiredFields = (companyName, jobTitle, jobDescr) => {
  const applicationUris = ['http://careers.google.com'];
  const requisitionId = `jobWithRequiredFields:${new Date().getTime()}`;

  const job = {
    requisitionId: requisitionId,
    title: jobTitle,
    applicationInfo: {uris: applicationUris},
    description: jobDescr,
    companyName: companyName,
  };

  console.log(`Job generated: ${JSON.stringify(job)}`);
  return job;
};

/**
 * Create a job.
 */
const createJob = async (jobServiceClient, jobToBeCreated) => {
  try {
    const request = {
      parent: `projects/${PROJECT_ID}`,
      resource: {
        job: jobToBeCreated,
      },
    };

    const jobCreated = await jobServiceClient.projects.jobs.create(request);

    console.log(`Job created: ${JSON.stringify(jobCreated.data)}`);
    return jobCreated.data;
  } catch (e) {
    console.error(`Got exception while creating job!`);
    throw e;
  }
};

/**
 * Get a job.
 */
const getJob = async (jobServiceClient, jobName) => {
  try {
    const request = {
      name: jobName,
    };

    const jobExisted = await jobServiceClient.projects.jobs.get(request);

    console.log(`Job existed: ${JSON.stringify(jobExisted.data)}`);
    return jobExisted.data;
  } catch (e) {
    console.error('Got exception while getting job');
    throw e;
  }
};


/**
 * Update a job.
 */
const updateJob = async (jobServiceClient, jobName, jobToBeUpdated) => {
  try {
    const request = {
      name: jobName,
      resource: {
        job: jobToBeUpdated,
      },
    };

    const jobUpdated = await jobServiceClient.projects.jobs.patch(request);

    console.log(`Job updated: ${JSON.stringify(jobUpdated.data)}`);
    return jobUpdated.data;
  } catch (e) {
    console.error(`Got exception while updating job!`);
    throw e;
  }
};


/**
 * Update a job with field mask.
 */
const updateJobWithFieldMask = async (jobServiceClient, jobName, jobToBeUpdated, fieldMask) => {
  try {
    const request = {
      name: jobName,
      resource: {
        job: jobToBeUpdated,
        updateMask: fieldMask,
      },
    };

    const jobUpdated = await jobServiceClient.projects.jobs.patch(request);

    console.log(`Job updated: ${JSON.stringify(jobUpdated.data)}`);
    return jobUpdated.data;
  } catch (e) {
    console.error(`Got exception while updating job with field mask!`);
    throw e;
  }
};

/**
 * Delete a job.
 */
const deleteJob = async (jobServiceClient, jobName) => {
  try {
    const request = {
      name: jobName,
    };

    await jobServiceClient.projects.jobs.delete(request);
    console.log('Job deleted');
  } catch (e) {
    console.error('Got exception while deleting job');
    throw e;
  }
};

// Run Sample
const runSample = async (data) => {
  try {
    // Create an authorized client
    const jobServiceClient = await createAuthCredential();

    // Create a company before creating jobs
    const companyCreated = await createCompany.createCompany(
      jobServiceClient,
      `company-${data.psid}`
    );

    const companyName = companyCreated.name;

    // Construct a job
    const jobToBeCreated = generateJobWithRequiredFields(companyName, data.title, data.descr);

    // Create a job
    const jobCreated = await createJob(jobServiceClient, jobToBeCreated);

  } catch (e) {
    console.log(e);
    throw e;
  }
};

module.exports = {
  generateJobWithRequiredFields: generateJobWithRequiredFields,
  createJob: createJob,
  deleteJob: deleteJob,
  runSample: runSample,
};