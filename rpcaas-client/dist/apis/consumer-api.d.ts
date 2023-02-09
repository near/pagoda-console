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
import { Consumer } from '../models';
import { ConsumerList } from '../models';
import { DeleteObject } from '../models';
import { UpsertConsumer } from '../models';
/**
 * ConsumerApi - axios parameter creator
 * @export
 */
export declare const ConsumerApiAxiosParamCreator: (configuration?: Configuration) => {
    /**
     * Deletes a KongConsumer object by name
     * @summary Delete consumer
     * @param {string} consumerName The name that needs to be deleted
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteConsumer: (consumerName: string, options?: AxiosRequestConfig) => Promise<RequestArgs>;
    /**
     *
     * @summary Get a KongConsumer object by name
     * @param {string} consumerName Name of the Kong Consumer object to get.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getConsumer: (consumerName: string, options?: AxiosRequestConfig) => Promise<RequestArgs>;
    /**
     *
     * @summary List all KongConsumer objects
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getConsumers: (options?: AxiosRequestConfig) => Promise<RequestArgs>;
    /**
     *
     * @summary Create new KongConsumer object by name
     * @param {UpsertConsumer} body KongConsumer object to create
     * @param {string} consumerName Name of the KongConsumer object to create.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    upsertConsumer: (body: UpsertConsumer, consumerName: string, options?: AxiosRequestConfig) => Promise<RequestArgs>;
};
/**
 * ConsumerApi - functional programming interface
 * @export
 */
export declare const ConsumerApiFp: (configuration?: Configuration) => {
    /**
     * Deletes a KongConsumer object by name
     * @summary Delete consumer
     * @param {string} consumerName The name that needs to be deleted
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteConsumer(consumerName: string, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => Promise<AxiosResponse<DeleteObject>>>;
    /**
     *
     * @summary Get a KongConsumer object by name
     * @param {string} consumerName Name of the Kong Consumer object to get.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getConsumer(consumerName: string, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => Promise<AxiosResponse<Consumer>>>;
    /**
     *
     * @summary List all KongConsumer objects
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getConsumers(options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => Promise<AxiosResponse<ConsumerList>>>;
    /**
     *
     * @summary Create new KongConsumer object by name
     * @param {UpsertConsumer} body KongConsumer object to create
     * @param {string} consumerName Name of the KongConsumer object to create.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    upsertConsumer(body: UpsertConsumer, consumerName: string, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => Promise<AxiosResponse<Consumer>>>;
};
/**
 * ConsumerApi - factory interface
 * @export
 */
export declare const ConsumerApiFactory: (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) => {
    /**
     * Deletes a KongConsumer object by name
     * @summary Delete consumer
     * @param {string} consumerName The name that needs to be deleted
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteConsumer(consumerName: string, options?: AxiosRequestConfig): Promise<AxiosResponse<DeleteObject>>;
    /**
     *
     * @summary Get a KongConsumer object by name
     * @param {string} consumerName Name of the Kong Consumer object to get.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getConsumer(consumerName: string, options?: AxiosRequestConfig): Promise<AxiosResponse<Consumer>>;
    /**
     *
     * @summary List all KongConsumer objects
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getConsumers(options?: AxiosRequestConfig): Promise<AxiosResponse<ConsumerList>>;
    /**
     *
     * @summary Create new KongConsumer object by name
     * @param {UpsertConsumer} body KongConsumer object to create
     * @param {string} consumerName Name of the KongConsumer object to create.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    upsertConsumer(body: UpsertConsumer, consumerName: string, options?: AxiosRequestConfig): Promise<AxiosResponse<Consumer>>;
};
/**
 * ConsumerApi - object-oriented interface
 * @export
 * @class ConsumerApi
 * @extends {BaseAPI}
 */
export declare class ConsumerApi extends BaseAPI {
    /**
     * Deletes a KongConsumer object by name
     * @summary Delete consumer
     * @param {string} consumerName The name that needs to be deleted
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ConsumerApi
     */
    deleteConsumer(consumerName: string, options?: AxiosRequestConfig): Promise<AxiosResponse<DeleteObject>>;
    /**
     *
     * @summary Get a KongConsumer object by name
     * @param {string} consumerName Name of the Kong Consumer object to get.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ConsumerApi
     */
    getConsumer(consumerName: string, options?: AxiosRequestConfig): Promise<AxiosResponse<Consumer>>;
    /**
     *
     * @summary List all KongConsumer objects
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ConsumerApi
     */
    getConsumers(options?: AxiosRequestConfig): Promise<AxiosResponse<ConsumerList>>;
    /**
     *
     * @summary Create new KongConsumer object by name
     * @param {UpsertConsumer} body KongConsumer object to create
     * @param {string} consumerName Name of the KongConsumer object to create.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ConsumerApi
     */
    upsertConsumer(body: UpsertConsumer, consumerName: string, options?: AxiosRequestConfig): Promise<AxiosResponse<Consumer>>;
}
