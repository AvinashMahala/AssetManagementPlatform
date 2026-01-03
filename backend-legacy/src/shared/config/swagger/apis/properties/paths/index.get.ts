/**
 * @openapi
 * /properties:
 *   get:
 *     summary: Get all properties
 *     tags: [Properties]
 *     parameters:
 *       - in: query
 *         name: ownerId
 *         schema:
 *           type: string
 *         description: Filter by owner ID
 *     responses:
 *       200:
 *         description: List of properties
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - id: "11111111-1111-1111-1111-111111111111"
 *                   name: "Sunset Apartments"
 *                   propertyType: "apartment"
 *                   status: "available"
 *                   currency: "INR"
 *                   address:
 *                     street: "123 Main St"
 *                     city: "Mumbai"
 *                     state: "MH"
 *                     pincode: "400001"
 *                     country: "India"
 *                   totalArea: 1200
 *                   buildingAmenities:
 *                     - "elevator"
 *                     - "security"
 *                   buildingPhotos:
 *                     - "https://example.com/photo1.jpg"
 *                   ownerId: "11111111-1111-1111-1111-111111111111"
 *                   ownerDetails:
 *                     name: "Owner Name"
 *                     mobileNumbers:
 *                       - "+911234567890"
 *                     emailIds:
 *                       - "owner@example.com"
 *                   createdAt: "2025-12-24T00:00:00Z"
 *                   updatedAt: "2025-12-24T00:00:00Z"
 */
