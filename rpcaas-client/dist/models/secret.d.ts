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
 * @interface Secret
 */
export interface Secret {
    /**
     * Name that makes logical sense for use in your service
     * @type {string}
     * @memberof Secret
     */
    api_token: string;
    /**
     *
     * @type {string}
     * @memberof Secret
     */
    name?: string;
}
