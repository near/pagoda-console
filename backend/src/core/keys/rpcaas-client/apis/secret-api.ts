/* tslint:disable */
/* eslint-disable */
/**
 * Endpoints as a Service Provisiong Service (epaas-ps)
 * This is the documentation for the Endpoint as a Service Provisioning Service system.
 *
 * OpenAPI spec version: 0.0.1
 * Contact: will@near.org
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
import globalAxios, {
  AxiosResponse,
  AxiosInstance,
  AxiosRequestConfig,
} from 'axios';
import { Configuration } from '../configuration';
// Some imports not used depending on template conditions
// @ts-ignore
import {
  BASE_PATH,
  COLLECTION_FORMATS,
  RequestArgs,
  BaseAPI,
  RequiredError,
} from '../base';
import { ApiResponse } from '../models';
import { Consumer } from '../models';
import { ConsumerSecrets } from '../models';
import { Secret } from '../models';
import { SecretBody } from '../models';
/**
 * SecretApi - axios parameter creator
 * @export
 */
export const SecretApiAxiosParamCreator = function (
  configuration?: Configuration,
) {
  return {
    /**
     *
     * @summary Create a new Kong secret object attached to a consumer
     * @param {SecretBody} body Kong secret object that needs to be created
     * @param {string} consumerName Name of the Kong Consumer object to get.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createConsumerSecret: async (
      body: SecretBody,
      consumerName: string,
      options: AxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'body' is not null or undefined
      if (body === null || body === undefined) {
        throw new RequiredError(
          'body',
          'Required parameter body was null or undefined when calling createConsumerSecret.',
        );
      }
      // verify required parameter 'consumerName' is not null or undefined
      if (consumerName === null || consumerName === undefined) {
        throw new RequiredError(
          'consumerName',
          'Required parameter consumerName was null or undefined when calling createConsumerSecret.',
        );
      }
      const localVarPath = `/secret/consumer/{consumerName}`.replace(
        `{${'consumerName'}}`,
        encodeURIComponent(String(consumerName)),
      );
      // use dummy base URL string because the URL constructor only accepts absolute URLs.
      const localVarUrlObj = new URL(localVarPath, 'https://example.com');
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }
      const localVarRequestOptions: AxiosRequestConfig = {
        method: 'POST',
        ...baseOptions,
        ...options,
      };
      const localVarHeaderParameter = {} as any;
      const localVarQueryParameter = {} as any;

      // authentication api_key required
      if (configuration && configuration.apiKey) {
        const localVarApiKeyValue =
          typeof configuration.apiKey === 'function'
            ? await configuration.apiKey('authorization')
            : await configuration.apiKey;
        localVarHeaderParameter['authorization'] = localVarApiKeyValue;
      }

      localVarHeaderParameter['Content-Type'] = 'application/json';

      const query = new URLSearchParams(localVarUrlObj.search);
      for (const key in localVarQueryParameter) {
        query.set(key, localVarQueryParameter[key]);
      }
      for (const key in options.params) {
        query.set(key, options.params[key]);
      }
      localVarUrlObj.search = new URLSearchParams(query).toString();
      let headersFromBaseOptions =
        baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = {
        ...localVarHeaderParameter,
        ...headersFromBaseOptions,
        ...options.headers,
      };
      const needsSerialization =
        typeof body !== 'string' ||
        localVarRequestOptions.headers['Content-Type'] === 'application/json';
      localVarRequestOptions.data = needsSerialization
        ? JSON.stringify(body !== undefined ? body : {})
        : body || '';

      return {
        url:
          localVarUrlObj.pathname + localVarUrlObj.search + localVarUrlObj.hash,
        options: localVarRequestOptions,
      };
    },
    /**
     * Remove a secret from a consumer and delete the secret from the cluster.
     * @summary Remove a user secret
     * @param {string} consumerName Name of the Kong secret object to get.
     * @param {string} secretName The name that needs to be deleted
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteSecret: async (
      consumerName: string,
      secretName: string,
      options: AxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'consumerName' is not null or undefined
      if (consumerName === null || consumerName === undefined) {
        throw new RequiredError(
          'consumerName',
          'Required parameter consumerName was null or undefined when calling deleteSecret.',
        );
      }
      // verify required parameter 'secretName' is not null or undefined
      if (secretName === null || secretName === undefined) {
        throw new RequiredError(
          'secretName',
          'Required parameter secretName was null or undefined when calling deleteSecret.',
        );
      }
      const localVarPath = `/secret/consumer/{consumerName}/{secretName}`
        .replace(
          `{${'consumerName'}}`,
          encodeURIComponent(String(consumerName)),
        )
        .replace(`{${'secretName'}}`, encodeURIComponent(String(secretName)));
      // use dummy base URL string because the URL constructor only accepts absolute URLs.
      const localVarUrlObj = new URL(localVarPath, 'https://example.com');
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }
      const localVarRequestOptions: AxiosRequestConfig = {
        method: 'DELETE',
        ...baseOptions,
        ...options,
      };
      const localVarHeaderParameter = {} as any;
      const localVarQueryParameter = {} as any;

      // authentication api_key required
      if (configuration && configuration.apiKey) {
        const localVarApiKeyValue =
          typeof configuration.apiKey === 'function'
            ? await configuration.apiKey('authorization')
            : await configuration.apiKey;
        localVarHeaderParameter['authorization'] = localVarApiKeyValue;
      }

      const query = new URLSearchParams(localVarUrlObj.search);
      for (const key in localVarQueryParameter) {
        query.set(key, localVarQueryParameter[key]);
      }
      for (const key in options.params) {
        query.set(key, options.params[key]);
      }
      localVarUrlObj.search = new URLSearchParams(query).toString();
      let headersFromBaseOptions =
        baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = {
        ...localVarHeaderParameter,
        ...headersFromBaseOptions,
        ...options.headers,
      };

      return {
        url:
          localVarUrlObj.pathname + localVarUrlObj.search + localVarUrlObj.hash,
        options: localVarRequestOptions,
      };
    },
    /**
     * Retrieve
     * @summary Get all secrets associated with specified consumer
     * @param {string} consumerName Name of the Kong Consumer object to get secrets from.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getConsumerSecrets: async (
      consumerName: string,
      options: AxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'consumerName' is not null or undefined
      if (consumerName === null || consumerName === undefined) {
        throw new RequiredError(
          'consumerName',
          'Required parameter consumerName was null or undefined when calling getConsumerSecrets.',
        );
      }
      const localVarPath = `/secret/consumer/{consumerName}`.replace(
        `{${'consumerName'}}`,
        encodeURIComponent(String(consumerName)),
      );
      // use dummy base URL string because the URL constructor only accepts absolute URLs.
      const localVarUrlObj = new URL(localVarPath, 'https://example.com');
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }
      const localVarRequestOptions: AxiosRequestConfig = {
        method: 'GET',
        ...baseOptions,
        ...options,
      };
      const localVarHeaderParameter = {} as any;
      const localVarQueryParameter = {} as any;

      // authentication api_key required
      if (configuration && configuration.apiKey) {
        const localVarApiKeyValue =
          typeof configuration.apiKey === 'function'
            ? await configuration.apiKey('authorization')
            : await configuration.apiKey;
        localVarHeaderParameter['authorization'] = localVarApiKeyValue;
      }

      const query = new URLSearchParams(localVarUrlObj.search);
      for (const key in localVarQueryParameter) {
        query.set(key, localVarQueryParameter[key]);
      }
      for (const key in options.params) {
        query.set(key, options.params[key]);
      }
      localVarUrlObj.search = new URLSearchParams(query).toString();
      let headersFromBaseOptions =
        baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = {
        ...localVarHeaderParameter,
        ...headersFromBaseOptions,
        ...options.headers,
      };

      return {
        url:
          localVarUrlObj.pathname + localVarUrlObj.search + localVarUrlObj.hash,
        options: localVarRequestOptions,
      };
    },
    /**
     *
     * @summary Get an existing Kong secret object
     * @param {string} secretName Name of the Kong secret object to get.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getSecret: async (
      secretName: string,
      options: AxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'secretName' is not null or undefined
      if (secretName === null || secretName === undefined) {
        throw new RequiredError(
          'secretName',
          'Required parameter secretName was null or undefined when calling getSecret.',
        );
      }
      const localVarPath = `/secret/{secretName}`.replace(
        `{${'secretName'}}`,
        encodeURIComponent(String(secretName)),
      );
      // use dummy base URL string because the URL constructor only accepts absolute URLs.
      const localVarUrlObj = new URL(localVarPath, 'https://example.com');
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }
      const localVarRequestOptions: AxiosRequestConfig = {
        method: 'GET',
        ...baseOptions,
        ...options,
      };
      const localVarHeaderParameter = {} as any;
      const localVarQueryParameter = {} as any;

      // authentication api_key required
      if (configuration && configuration.apiKey) {
        const localVarApiKeyValue =
          typeof configuration.apiKey === 'function'
            ? await configuration.apiKey('authorization')
            : await configuration.apiKey;
        localVarHeaderParameter['authorization'] = localVarApiKeyValue;
      }

      const query = new URLSearchParams(localVarUrlObj.search);
      for (const key in localVarQueryParameter) {
        query.set(key, localVarQueryParameter[key]);
      }
      for (const key in options.params) {
        query.set(key, options.params[key]);
      }
      localVarUrlObj.search = new URLSearchParams(query).toString();
      let headersFromBaseOptions =
        baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = {
        ...localVarHeaderParameter,
        ...headersFromBaseOptions,
        ...options.headers,
      };

      return {
        url:
          localVarUrlObj.pathname + localVarUrlObj.search + localVarUrlObj.hash,
        options: localVarRequestOptions,
      };
    },
  };
};

/**
 * SecretApi - functional programming interface
 * @export
 */
export const SecretApiFp = function (configuration?: Configuration) {
  return {
    /**
     *
     * @summary Create a new Kong secret object attached to a consumer
     * @param {SecretBody} body Kong secret object that needs to be created
     * @param {string} consumerName Name of the Kong Consumer object to get.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async createConsumerSecret(
      body: SecretBody,
      consumerName: string,
      options?: AxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => Promise<AxiosResponse<ApiResponse>>
    > {
      const localVarAxiosArgs = await SecretApiAxiosParamCreator(
        configuration,
      ).createConsumerSecret(body, consumerName, options);
      return (
        axios: AxiosInstance = globalAxios,
        basePath: string = BASE_PATH,
      ) => {
        const axiosRequestArgs: AxiosRequestConfig = {
          ...localVarAxiosArgs.options,
          url: basePath + localVarAxiosArgs.url,
        };
        return axios.request(axiosRequestArgs);
      };
    },
    /**
     * Remove a secret from a consumer and delete the secret from the cluster.
     * @summary Remove a user secret
     * @param {string} consumerName Name of the Kong secret object to get.
     * @param {string} secretName The name that needs to be deleted
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async deleteSecret(
      consumerName: string,
      secretName: string,
      options?: AxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => Promise<AxiosResponse<Consumer>>
    > {
      const localVarAxiosArgs = await SecretApiAxiosParamCreator(
        configuration,
      ).deleteSecret(consumerName, secretName, options);
      return (
        axios: AxiosInstance = globalAxios,
        basePath: string = BASE_PATH,
      ) => {
        const axiosRequestArgs: AxiosRequestConfig = {
          ...localVarAxiosArgs.options,
          url: basePath + localVarAxiosArgs.url,
        };
        return axios.request(axiosRequestArgs);
      };
    },
    /**
     * Retrieve
     * @summary Get all secrets associated with specified consumer
     * @param {string} consumerName Name of the Kong Consumer object to get secrets from.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getConsumerSecrets(
      consumerName: string,
      options?: AxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => Promise<AxiosResponse<ConsumerSecrets>>
    > {
      const localVarAxiosArgs = await SecretApiAxiosParamCreator(
        configuration,
      ).getConsumerSecrets(consumerName, options);
      return (
        axios: AxiosInstance = globalAxios,
        basePath: string = BASE_PATH,
      ) => {
        const axiosRequestArgs: AxiosRequestConfig = {
          ...localVarAxiosArgs.options,
          url: basePath + localVarAxiosArgs.url,
        };
        return axios.request(axiosRequestArgs);
      };
    },
    /**
     *
     * @summary Get an existing Kong secret object
     * @param {string} secretName Name of the Kong secret object to get.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getSecret(
      secretName: string,
      options?: AxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => Promise<AxiosResponse<Secret>>
    > {
      const localVarAxiosArgs = await SecretApiAxiosParamCreator(
        configuration,
      ).getSecret(secretName, options);
      return (
        axios: AxiosInstance = globalAxios,
        basePath: string = BASE_PATH,
      ) => {
        const axiosRequestArgs: AxiosRequestConfig = {
          ...localVarAxiosArgs.options,
          url: basePath + localVarAxiosArgs.url,
        };
        return axios.request(axiosRequestArgs);
      };
    },
  };
};

/**
 * SecretApi - factory interface
 * @export
 */
export const SecretApiFactory = function (
  configuration?: Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) {
  return {
    /**
     *
     * @summary Create a new Kong secret object attached to a consumer
     * @param {SecretBody} body Kong secret object that needs to be created
     * @param {string} consumerName Name of the Kong Consumer object to get.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async createConsumerSecret(
      body: SecretBody,
      consumerName: string,
      options?: AxiosRequestConfig,
    ): Promise<AxiosResponse<ApiResponse>> {
      return SecretApiFp(configuration)
        .createConsumerSecret(body, consumerName, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Remove a secret from a consumer and delete the secret from the cluster.
     * @summary Remove a user secret
     * @param {string} consumerName Name of the Kong secret object to get.
     * @param {string} secretName The name that needs to be deleted
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async deleteSecret(
      consumerName: string,
      secretName: string,
      options?: AxiosRequestConfig,
    ): Promise<AxiosResponse<Consumer>> {
      return SecretApiFp(configuration)
        .deleteSecret(consumerName, secretName, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Retrieve
     * @summary Get all secrets associated with specified consumer
     * @param {string} consumerName Name of the Kong Consumer object to get secrets from.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getConsumerSecrets(
      consumerName: string,
      options?: AxiosRequestConfig,
    ): Promise<AxiosResponse<ConsumerSecrets>> {
      return SecretApiFp(configuration)
        .getConsumerSecrets(consumerName, options)
        .then((request) => request(axios, basePath));
    },
    /**
     *
     * @summary Get an existing Kong secret object
     * @param {string} secretName Name of the Kong secret object to get.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getSecret(
      secretName: string,
      options?: AxiosRequestConfig,
    ): Promise<AxiosResponse<Secret>> {
      return SecretApiFp(configuration)
        .getSecret(secretName, options)
        .then((request) => request(axios, basePath));
    },
  };
};

/**
 * SecretApi - object-oriented interface
 * @export
 * @class SecretApi
 * @extends {BaseAPI}
 */
export class SecretApi extends BaseAPI {
  /**
   *
   * @summary Create a new Kong secret object attached to a consumer
   * @param {SecretBody} body Kong secret object that needs to be created
   * @param {string} consumerName Name of the Kong Consumer object to get.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SecretApi
   */
  public async createConsumerSecret(
    body: SecretBody,
    consumerName: string,
    options?: AxiosRequestConfig,
  ): Promise<AxiosResponse<ApiResponse>> {
    return SecretApiFp(this.configuration)
      .createConsumerSecret(body, consumerName, options)
      .then((request) => request(this.axios, this.basePath));
  }
  /**
   * Remove a secret from a consumer and delete the secret from the cluster.
   * @summary Remove a user secret
   * @param {string} consumerName Name of the Kong secret object to get.
   * @param {string} secretName The name that needs to be deleted
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SecretApi
   */
  public async deleteSecret(
    consumerName: string,
    secretName: string,
    options?: AxiosRequestConfig,
  ): Promise<AxiosResponse<Consumer>> {
    return SecretApiFp(this.configuration)
      .deleteSecret(consumerName, secretName, options)
      .then((request) => request(this.axios, this.basePath));
  }
  /**
   * Retrieve
   * @summary Get all secrets associated with specified consumer
   * @param {string} consumerName Name of the Kong Consumer object to get secrets from.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SecretApi
   */
  public async getConsumerSecrets(
    consumerName: string,
    options?: AxiosRequestConfig,
  ): Promise<AxiosResponse<ConsumerSecrets>> {
    return SecretApiFp(this.configuration)
      .getConsumerSecrets(consumerName, options)
      .then((request) => request(this.axios, this.basePath));
  }
  /**
   *
   * @summary Get an existing Kong secret object
   * @param {string} secretName Name of the Kong secret object to get.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SecretApi
   */
  public async getSecret(
    secretName: string,
    options?: AxiosRequestConfig,
  ): Promise<AxiosResponse<Secret>> {
    return SecretApiFp(this.configuration)
      .getSecret(secretName, options)
      .then((request) => request(this.axios, this.basePath));
  }
}
