import { createSwaggerSpec } from 'next-swagger-doc';
import { NextResponse } from 'next/server';

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     CarbonUsage:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the carbon usage record
 *         userId:
 *           type: string
 *           description: User ID associated with the carbon usage
 *         organizationId:
 *           type: string
 *           description: Organization ID associated with the carbon usage
 *         invoiceCount:
 *           type: number
 *           description: Number of invoices processed in the period
 *         emailCount:
 *           type: number
 *           description: Number of emails sent in the period
 *         storageGb:
 *           type: number
 *           description: Storage used in GB
 *         apiCallCount:
 *           type: number
 *           description: Number of API calls made in the period
 *         customUsage:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               amount:
 *                 type: number
 *               unit:
 *                 type: string
 *               carbonInKg:
 *                 type: number
 *         totalCarbonInKg:
 *           type: number
 *           description: Total carbon footprint in kg CO2e
 *         offsetCarbonInKg:
 *           type: number
 *           description: Amount of carbon that has been offset in kg CO2e
 *         remainingCarbonInKg:
 *           type: number
 *           description: Amount of carbon not yet offset in kg CO2e
 *         period:
 *           type: object
 *           properties:
 *             startDate:
 *               type: string
 *               format: date-time
 *             endDate:
 *               type: string
 *               format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CarbonOffset:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the offset purchase
 *         userId:
 *           type: string
 *           description: User ID associated with the offset purchase
 *         organizationId:
 *           type: string
 *           description: Organization ID associated with the offset purchase
 *         purchaseId:
 *           type: string
 *           description: ID from the offset provider
 *         estimateId:
 *           type: string
 *           description: Estimate ID from the offset provider
 *         carbonInKg:
 *           type: number
 *           description: Amount of carbon offset in kg CO2e
 *         costInUsdCents:
 *           type: number
 *           description: Cost of the offset in USD cents
 *         projectType:
 *           type: string
 *           enum: [RENEWABLE_ENERGY, FORESTRY, METHANE_CAPTURE, ENERGY_EFFICIENCY, TRANSPORTATION, OTHER]
 *         projectName:
 *           type: string
 *         projectLocation:
 *           type: string
 *         receiptUrl:
 *           type: string
 *         certificateUrl:
 *           type: string
 *         status:
 *           type: string
 *           enum: [PENDING, COMPLETED, FAILED, REFUNDED]
 *         purchaseDate:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CarbonGoal:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the carbon reduction goal
 *         name:
 *           type: string
 *           description: Name of the goal
 *         description:
 *           type: string
 *           description: Description of the goal
 *         organizationId:
 *           type: string
 *           description: Organization ID associated with the goal
 *         departmentId:
 *           type: string
 *           description: Optional department ID
 *         projectId:
 *           type: string
 *           description: Optional project ID
 *         baselineCarbonInKg:
 *           type: number
 *           description: Baseline carbon amount in kg CO2e
 *         targetCarbonInKg:
 *           type: number
 *           description: Target carbon amount in kg CO2e
 *         targetReductionPercentage:
 *           type: number
 *           description: Target reduction percentage
 *         startDate:
 *           type: string
 *           format: date-time
 *         targetDate:
 *           type: string
 *           format: date-time
 *         status:
 *           type: string
 *           enum: [ACTIVE, COMPLETED, FAILED, CANCELLED]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     Department:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         organizationId:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     Project:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         organizationId:
 *           type: string
 *         departmentId:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     StandardCompliance:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         organizationId:
 *           type: string
 *         standard:
 *           type: string
 *           enum: [GHG_PROTOCOL, ISO_14064, TCFD, CDP, SASB, OTHER]
 *         compliant:
 *           type: boolean
 *         verificationBody:
 *           type: string
 *         verificationDate:
 *           type: string
 *           format: date-time
 *         nextVerificationDate:
 *           type: string
 *           format: date-time
 *         certificateUrl:
 *           type: string
 *         notes:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 */

/**
 * @swagger
 * tags:
 *   - name: Carbon Usage
 *     description: Carbon usage tracking endpoints
 *   - name: Carbon Offsets
 *     description: Carbon offset purchase and management
 *   - name: Carbon Goals
 *     description: Carbon reduction goals tracking
 *   - name: Departments
 *     description: Department management
 *   - name: Projects
 *     description: Project management
 *   - name: Standards
 *     description: Standards compliance
 */

export async function GET() {
  const spec = createSwaggerSpec({
    apiFolder: 'src/app/api',
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'ClimaBill Carbon Tracking API',
        version: '1.0.0',
        description: 'API documentation for ClimaBill carbon tracking and management features',
        contact: {
          name: 'ClimaBill Support',
          email: 'support@climabill.com',
        },
      },
      servers: [
        {
          url: 'https://app.climabill.com/api',
          description: 'Production server',
        },
        {
          url: 'http://localhost:3000/api',
          description: 'Development server',
        },
      ],
    },
  });

  return NextResponse.json(spec);
}
