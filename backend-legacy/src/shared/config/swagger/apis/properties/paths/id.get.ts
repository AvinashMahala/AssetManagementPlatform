/**
 * @openapi
 * /properties/{id}:
 *   get:
 *     summary: Get property by ID
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     responses:
 *       200:
 *         description: Property details
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: "11111111-1111-1111-1111-111111111111"
 *                 name: "Sunset Apartments"
 *                 propertyType: "apartment"
 *                 status: "available"
 *                 currency: "INR"
 *                 address:
 *                   street: "123 Main St"
 *                   city: "Mumbai"
 *                   state: "MH"
 *                   pincode: "400001"
 *                   country: "India"
 *                 totalArea: 1200
 *                 buildingAmenities:
 *                   - "elevator"
 *                   - "security"
 *                 buildingPhotos:
 *                   - "https://example.com/photo1.jpg"
 *                 ownerId: "11111111-1111-1111-1111-111111111111"
 *                 ownerDetails:
 *                   name: "Owner Name"
 *                   mobileNumbers:
 *                     - "+911234567890"
 *                   emailIds:
 *                     - "owner@example.com"
 *                 amenities:
 *                   basic:
 *                     - "elevator"
 *                     - "security"
 *                   luxury: []
 *                   additionalInfo:
 *                     petFriendly: false
 *                     smokingAllowed: false
 *                     eventsAllowed: false
 *                 createdAt: "2025-12-24T00:00:00Z"
 *                 updatedAt: "2025-12-24T00:00:00Z"
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error: "Bad request"
 *       404:
 *         description: Resource not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error: "Resource not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error: "Internal server error"
 */
