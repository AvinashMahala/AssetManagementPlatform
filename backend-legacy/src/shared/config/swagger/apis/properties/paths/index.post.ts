/**
 * @openapi
 * /properties:
 *   post:
 *     summary: Create a new property
 *     tags: [Properties]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PropertyInput'
 *     responses:
 *       201:
 *         description: Property created successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: "11111111-1111-1111-1111-111111111111"
 *                 name: "Sunset Apartments"
 *                 propertyType: "apartment"
 *                 status: "available"
 *                 totalArea: 1200
 *                 buildingAmenities:
 *                   - "elevator"
 *                   - "security"
 *                 buildingPhotos:
 *                   - "https://example.com/photo1.jpg"
 *                 ownerId: "11111111-1111-1111-1111-111111111111"
 *                 createdAt: "2025-12-24T00:00:00Z"
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error: "Bad request"
 */
