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
import { Consumer } from '../models';
import { ConsumerList } from '../models';
import { DeleteObject } from '../models';
import { UpsertConsumer } from '../models';
/**
 * ConsumerApi - axios parameter creator
 * @export
 */
export const ConsumerApiAxiosParamCreator = function (
  configuration?: Configuration,
) {
  return {
    /**
     * Deletes a KongConsumer object by name
     * @summary Delete consumer
     * @param {string} consumerName The name that needs to be deleted
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteConsumer: async (
      consumerName: string,
      options: AxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'consumerName' is not null or undefined
      if (consumerName === null || consumerName === undefined) {
        throw new RequiredError(
          'consumerName',
          'Required parameter consumerName was null or undefined when calling deleteConsumer.',
        );
      }
      const localVarPath = `/consumer/{consumerName}`.replace(
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
     *
     * @summary Get a KongConsumer object by name
     * @param {string} consumerName Name of the Kong Consumer object to get.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getConsumer: async (
      consumerName: string,
      options: AxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'consumerName' is not null or undefined
      if (consumerName === null || consumerName === undefined) {
        throw new RequiredError(
          'consumerName',
          'Required parameter consumerName was null or undefined when calling getConsumer.',
        );
      }
      const localVarPath = `/consumer/{consumerName}`.replace(
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
     * @summary List all KongConsumer objects
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getConsumers: async (
      options: AxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      const localVarPath = `/consumer`;
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
     * @summary Create new KongConsumer object by name
     * @param {UpsertConsumer} body KongConsumer object to create
     * @param {string} consumerName Name of the KongConsumer object to create.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    upsertConsumer: async (
      body: UpsertConsumer,
      consumerName: string,
      options: AxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'body' is not null or undefined
      if (body === null || body === undefined) {
        throw new RequiredError(
          'body',
          'Required parameter body was null or undefined when calling upsertConsumer.',
        );
      }
      // verify required parameter 'consumerName' is not null or undefined
      if (consumerName === null || consumerName === undefined) {
        throw new RequiredError(
          'consumerName',
          'Required parameter consumerName was null or undefined when calling upsertConsumer.',
        );
      }
      const localVarPath = `/consumer/{consumerName}`.replace(
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
  };
};

/**
 * ConsumerApi - functional programming interface
 * @export
 */
export const ConsumerApiFp = function (configuration?: Configuration) {
  return {
    /**
     * Deletes a KongConsumer object by name
     * @summary Delete consumer
     * @param {string} consumerName The name that needs to be deleted
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async deleteConsumer(
      consumerName: string,
      options?: AxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => Promise<AxiosResponse<DeleteObject>>
    > {
      const localVarAxiosArgs = await ConsumerApiAxiosParamCreator(
        configuration,
      ).deleteConsumer(consumerName, options);
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
     * @summary Get a KongConsumer object by name
     * @param {string} consumerName Name of the Kong Consumer object to get.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getConsumer(
      consumerName: string,
      options?: AxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => Promise<AxiosResponse<Consumer>>
    > {
      const localVarAxiosArgs = await ConsumerApiAxiosParamCreator(
        configuration,
      ).getConsumer(consumerName, options);
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
     * @summary List all KongConsumer objects
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getConsumers(
      options?: AxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => Promise<AxiosResponse<ConsumerList>>
    > {
      const localVarAxiosArgs = await ConsumerApiAxiosParamCreator(
        configuration,
      ).getConsumers(options);
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
     * @summary Create new KongConsumer object by name
     * @param {UpsertConsumer} body KongConsumer object to create
     * @param {string} consumerName Name of the KongConsumer object to create.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async upsertConsumer(
      body: UpsertConsumer,
      consumerName: string,
      options?: AxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => Promise<AxiosResponse<Consumer>>
    > {
      const localVarAxiosArgs = await ConsumerApiAxiosParamCreator(
        configuration,
      ).upsertConsumer(body, consumerName, options);
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
 * ConsumerApi - factory interface
 * @export
 */
export const ConsumerApiFactory = function (
  configuration?: Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) {
  return {
    /**
     * Deletes a KongConsumer object by name
     * @summary Delete consumer
     * @param {string} consumerName The name that needs to be deleted
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async deleteConsumer(
      consumerName: string,
      options?: AxiosRequestConfig,
    ): Promise<AxiosResponse<DeleteObject>> {
      return ConsumerApiFp(configuration)
        .deleteConsumer(consumerName, options)
        .then((request) => request(axios, basePath));
    },
    /**
     *
     * @summary Get a KongConsumer object by name
     * @param {string} consumerName Name of the Kong Consumer object to get.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getConsumer(
      consumerName: string,
      options?: AxiosRequestConfig,
    ): Promise<AxiosResponse<Consumer>> {
      return ConsumerApiFp(configuration)
        .getConsumer(consumerName, options)
        .then((request) => request(axios, basePath));
    },
    /**
     *
     * @summary List all KongConsumer objects
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getConsumers(
      options?: AxiosRequestConfig,
    ): Promise<AxiosResponse<ConsumerList>> {
      return ConsumerApiFp(configuration)
        .getConsumers(options)
        .then((request) => request(axios, basePath));
    },
    /**
     *
     * @summary Create new KongConsumer object by name
     * @param {UpsertConsumer} body KongConsumer object to create
     * @param {string} consumerName Name of the KongConsumer object to create.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async upsertConsumer(
      body: UpsertConsumer,
      consumerName: string,
      options?: AxiosRequestConfig,
    ): Promise<AxiosResponse<Consumer>> {
      return ConsumerApiFp(configuration)
        .upsertConsumer(body, consumerName, options)
        .then((request) => request(axios, basePath));
    },
  };
};

/**
 * ConsumerApi - object-oriented interface
 * @export
 * @class ConsumerApi
 * @extends {BaseAPI}
 */
export class ConsumerApi extends BaseAPI {
  /**
   * Deletes a KongConsumer object by name
   * @summary Delete consumer
   * @param {string} consumerName The name that needs to be deleted
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ConsumerApi
   */
  public async deleteConsumer(
    consumerName: string,
    options?: AxiosRequestConfig,
  ): Promise<AxiosResponse<DeleteObject>> {
    return ConsumerApiFp(this.configuration)
      .deleteConsumer(consumerName, options)
      .then((request) => request(this.axios, this.basePath));
  }
  /**
   *
   * @summary Get a KongConsumer object by name
   * @param {string} consumerName Name of the Kong Consumer object to get.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ConsumerApi
   */
  public async getConsumer(
    consumerName: string,
    options?: AxiosRequestConfig,
  ): Promise<AxiosResponse<Consumer>> {
    return ConsumerApiFp(this.configuration)
      .getConsumer(consumerName, options)
      .then((request) => request(this.axios, this.basePath));
  }
  /**
   *
   * @summary List all KongConsumer objects
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ConsumerApi
   */
  public async getConsumers(
    options?: AxiosRequestConfig,
  ): Promise<AxiosResponse<ConsumerList>> {
    return ConsumerApiFp(this.configuration)
      .getConsumers(options)
      .then((request) => request(this.axios, this.basePath));
  }
  /**
   *
   * @summary Create new KongConsumer object by name
   * @param {UpsertConsumer} body KongConsumer object to create
   * @param {string} consumerName Name of the KongConsumer object to create.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ConsumerApi
   */
  public async upsertConsumer(
    body: UpsertConsumer,
    consumerName: string,
    options?: AxiosRequestConfig,
  ): Promise<AxiosResponse<Consumer>> {
    return ConsumerApiFp(this.configuration)
      .upsertConsumer(body, consumerName, options)
      .then((request) => request(this.axios, this.basePath));
  }
}
