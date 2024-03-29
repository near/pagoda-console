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
 * @interface UpsertConsumer
 */
export interface UpsertConsumer {
    /**
     * List of credentials names associated with the consumer
     * @type {Array<string>}
     * @memberof UpsertConsumer
     */
    credentials?: Array<string>;
    /**
     *
     * @type {string}
     * @memberof UpsertConsumer
     */
    custom_id: string;
    /**
     *
     * @type {string}
     * @memberof UpsertConsumer
     */
    name?: string;
    /**
     *
     * @type {string}
     * @memberof UpsertConsumer
     */
    rate_limiting_policy: string;
    /**
     *
     * @type {string}
     * @memberof UpsertConsumer
     */
    username: string;
}
