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
/**
 * 
 * @export
 * @interface Consumer
 */
export interface Consumer {
    /**
     * List of credentials names associated with the consumer
     * @type {Array<string>}
     * @memberof Consumer
     */
    credentials?: Array<string>;
    /**
     * Additional ID field used for further linking with external systems
     * @type {string}
     * @memberof Consumer
     */
    custom_id: string;
    /**
     * Name of KongConsumer
     * @type {string}
     * @memberof Consumer
     */
    name?: string;
    /**
     * Specifies the rate limiting policy to apply to the consumer.
     * @type {string}
     * @memberof Consumer
     */
    rate_limiting_policy: ConsumerRateLimitingPolicyEnum;
    /**
     * Username of user in external system
     * @type {string}
     * @memberof Consumer
     */
    username: string;
}

/**
    * @export
    * @enum {string}
    */
export enum ConsumerRateLimitingPolicyEnum {
    Developer = 'developer',
    Startup = 'startup',
    Enterprise = 'enterprise'
}

