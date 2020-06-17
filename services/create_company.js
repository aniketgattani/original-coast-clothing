'use strict';

const createAuthCredential = require('./google_auth');

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT;

/**
 * This file contains the basic knowledge about company and job, including:
 *
 * - Construct a company with required fields
 *
 * - Create a company
 *
 * - Get a company
 *
 * - Update a company
 *
 * - Update a company with field mask
 *
 * - Delete a company
 */

// [START basic_company]

/**
 * Generate a company
 */
const generateCompany = (company_name) => {

  const externalId = `${company_name}-${new Date().getTime()}`;

  const company = {
    displayName: company_name,
    externalId: externalId
  };

  console.log(`Company generated: ${JSON.stringify(company)}`);
  return company;
};

/**
 * Create a company.
 */
const createCompany = async(jobServiceClient, company_name) => {
  try {

    // Construct a company
    const companyToBeCreated = generateCompany(company_name);

    const request = {
      parent: `projects/${PROJECT_ID}`,
      resource: {
        company: companyToBeCreated,
      },
    };

    const companyCreated = await jobServiceClient.projects.companies.create(
      request
    );

    console.log(`Company created: ${JSON.stringify(companyCreated.data)}`);
    return companyCreated.data;
  } catch (e) {
    console.error(`Failed to create company! ${e}`);
  }
};


/**
 * Get a company.
 */
const getCompany = async (jobServiceClient, companyName) => {
  try {
    const request = {
      name: companyName,
    };

    const companyExisted = await jobServiceClient.projects.companies.get(
      request
    );

    console.log(`Company existed: ${JSON.stringify(companyExisted.data)}`);
    return companyExisted.data;
  } catch (e) {
    console.error('Got exception while getting company');
    throw e;
  }
};


/**
 * Updates a company.
 */
const updateCompany = async (jobServiceClient, companyName, companyToBeUpdated) => {
  try {
    const request = {
      name: companyName,
      resource: {
        company: companyToBeUpdated,
      },
    };

    const companyUpdated = await jobServiceClient.projects.companies.patch(
      request
    );

    console.log(`Company updated: ${JSON.stringify(companyUpdated.data)}`);
    return companyUpdated.data;
  } catch (e) {
    console.error(`Got exception while updating company! ${e}`);
    throw e;
  }
};

/**
 * Updates a company with field mask.
 */
const updateCompanyWithFieldMask = async (jobServiceClient, companyName, companyToBeUpdated, fieldMask) => {
  try {
    const request = {
      name: companyName,
      resource: {
        company: companyToBeUpdated,
        updateMask: fieldMask,
      },
    };

    const companyUpdated = await jobServiceClient.projects.companies.patch(
      request
    );

    console.log(`Company updated: ${JSON.stringify(companyUpdated.data)}`);
    return companyUpdated.data;
  } catch (e) {
    console.error(`Got exception while updating company with field mask! ${e}`);
    throw e;
  }
};

/**
 * Delete a company.
 */
const deleteCompany = async (jobServiceClient, companyName) => {
  try {
    const request = {
      name: companyName,
    };

    await jobServiceClient.projects.companies.delete(request);
    console.log('Company deleted');
  } catch (e) {
    console.error('Got exception while deleting company');
    throw e;
  }
};


module.exports = {
  generateCompany: generateCompany,
  createCompany: createCompany,
  deleteCompany: deleteCompany
};