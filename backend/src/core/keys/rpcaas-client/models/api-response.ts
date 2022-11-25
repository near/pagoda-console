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
import { ApiResponseMetadata } from './api-response-metadata';
/**
 *
 * @export
 * @interface ApiResponse
 */
export interface ApiResponse {
  /**
   *
   * @type {string}
   * @memberof ApiResponse
   */
  algorithm?: string;
  /**
   *
   * @type {Array<string>}
   * @memberof ApiResponse
   */
  credentials?: Array<string>;
  /**
   *
   * @type {string}
   * @memberof ApiResponse
   */
  custom_id?: string;
  /**
   *
   * @type {string}
   * @memberof ApiResponse
   */
  key?: string;
  /**
   *
   * @type {ApiResponseMetadata}
   * @memberof ApiResponse
   */
  metadata?: ApiResponseMetadata;
  /**
   *
   * @type {string}
   * @memberof ApiResponse
   */
  rsa_public_key?: string;
  /**
   *
   * @type {string}
   * @memberof ApiResponse
   */
  username?: string;
}
