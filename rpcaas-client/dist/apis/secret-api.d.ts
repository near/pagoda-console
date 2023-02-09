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
import { AxiosResponse, AxiosInstance, AxiosRequestConfig } from 'axios';
import { Configuration } from '../configuration';
import { RequestArgs, BaseAPI } from '../base';
import { ApiResponse } from '../models';
import { Consumer } from '../models';
import { ConsumerSecrets } from '../models';
import { Secret } from '../models';
import { SecretBody } from '../models';
/**
 * SecretApi - axios parameter creator
 * @export
 */
export declare const SecretApiAxiosParamCreator: (configuration?: Configuration) => {
    /**
     *
     * @summary Create a new Kong secret object attached to a consumer
     * @param {SecretBody} body Kong secret object that needs to be created
     * @param {string} consumerName Name of the Kong Consumer object to get.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createConsumerSecret: (body: SecretBody, consumerName: string, options?: AxiosRequestConfig) => Promise<RequestArgs>;
    /**
     * Remove a secret from a consumer and delete the secret from the cluster.
     * @summary Remove a user secret
     * @param {string} consumerName Name of the Kong secret object to get.
     * @param {string} secretName The name that needs to be deleted
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteSecret: (consumerName: string, secretName: string, options?: AxiosRequestConfig) => Promise<RequestArgs>;
    /**
     * Retrieve
     * @summary Get all secrets associated with specified consumer
     * @param {string} consumerName Name of the Kong Consumer object to get secrets from.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getConsumerSecrets: (consumerName: string, options?: AxiosRequestConfig) => Promise<RequestArgs>;
    /**
     *
     * @summary Get an existing Kong secret object
     * @param {string} secretName Name of the Kong secret object to get.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getSecret: (secretName: string, options?: AxiosRequestConfig) => Promise<RequestArgs>;
};
/**
 * SecretApi - functional programming interface
 * @export
 */
export declare const SecretApiFp: (configuration?: Configuration) => {
    /**
     *
     * @summary Create a new Kong secret object attached to a consumer
     * @param {SecretBody} body Kong secret object that needs to be created
     * @param {string} consumerName Name of the Kong Consumer object to get.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createConsumerSecret(body: SecretBody, consumerName: string, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => Promise<AxiosResponse<ApiResponse>>>;
    /**
     * Remove a secret from a consumer and delete the secret from the cluster.
     * @summary Remove a user secret
     * @param {string} consumerName Name of the Kong secret object to get.
     * @param {string} secretName The name that needs to be deleted
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteSecret(consumerName: string, secretName: string, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => Promise<AxiosResponse<Consumer>>>;
    /**
     * Retrieve
     * @summary Get all secrets associated with specified consumer
     * @param {string} consumerName Name of the Kong Consumer object to get secrets from.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getConsumerSecrets(consumerName: string, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => Promise<AxiosResponse<ConsumerSecrets>>>;
    /**
     *
     * @summary Get an existing Kong secret object
     * @param {string} secretName Name of the Kong secret object to get.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getSecret(secretName: string, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => Promise<AxiosResponse<Secret>>>;
};
/**
 * SecretApi - factory interface
 * @export
 */
export declare const SecretApiFactory: (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) => {
    /**
     *
     * @summary Create a new Kong secret object attached to a consumer
     * @param {SecretBody} body Kong secret object that needs to be created
     * @param {string} consumerName Name of the Kong Consumer object to get.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createConsumerSecret(body: SecretBody, consumerName: string, options?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse>>;
    /**
     * Remove a secret from a consumer and delete the secret from the cluster.
     * @summary Remove a user secret
     * @param {string} consumerName Name of the Kong secret object to get.
     * @param {string} secretName The name that needs to be deleted
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteSecret(consumerName: string, secretName: string, options?: AxiosRequestConfig): Promise<AxiosResponse<Consumer>>;
    /**
     * Retrieve
     * @summary Get all secrets associated with specified consumer
     * @param {string} consumerName Name of the Kong Consumer object to get secrets from.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getConsumerSecrets(consumerName: string, options?: AxiosRequestConfig): Promise<AxiosResponse<ConsumerSecrets>>;
    /**
     *
     * @summary Get an existing Kong secret object
     * @param {string} secretName Name of the Kong secret object to get.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getSecret(secretName: string, options?: AxiosRequestConfig): Promise<AxiosResponse<Secret>>;
};
/**
 * SecretApi - object-oriented interface
 * @export
 * @class SecretApi
 * @extends {BaseAPI}
 */
export declare class SecretApi extends BaseAPI {
    /**
     *
     * @summary Create a new Kong secret object attached to a consumer
     * @param {SecretBody} body Kong secret object that needs to be created
     * @param {string} consumerName Name of the Kong Consumer object to get.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof SecretApi
     */
    createConsumerSecret(body: SecretBody, consumerName: string, options?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse>>;
    /**
     * Remove a secret from a consumer and delete the secret from the cluster.
     * @summary Remove a user secret
     * @param {string} consumerName Name of the Kong secret object to get.
     * @param {string} secretName The name that needs to be deleted
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof SecretApi
     */
    deleteSecret(consumerName: string, secretName: string, options?: AxiosRequestConfig): Promise<AxiosResponse<Consumer>>;
    /**
     * Retrieve
     * @summary Get all secrets associated with specified consumer
     * @param {string} consumerName Name of the Kong Consumer object to get secrets from.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof SecretApi
     */
    getConsumerSecrets(consumerName: string, options?: AxiosRequestConfig): Promise<AxiosResponse<ConsumerSecrets>>;
    /**
     *
     * @summary Get an existing Kong secret object
     * @param {string} secretName Name of the Kong secret object to get.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof SecretApi
     */
    getSecret(secretName: string, options?: AxiosRequestConfig): Promise<AxiosResponse<Secret>>;
}
