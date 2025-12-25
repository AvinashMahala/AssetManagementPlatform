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
 *
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
 *
 *   put:
 *     summary: Update a property
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PropertyInput'
 *     responses:
 *       200:
 *         description: Property updated successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: "11111111-1111-1111-1111-111111111111"
 *                 name: "Sunset Apartments (Updated)"
 *                 propertyType: "apartment"
 *                 status: "available"
 *                 totalArea: 1300
 *                 buildingAmenities:
 *                   - "elevator"
 *                   - "security"
 *                   - "parking"
 *                 buildingPhotos:
 *                   - "https://example.com/photo1.jpg"
 *                 updatedAt: "2025-12-25T00:00:00Z"
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
 *
 
 *   delete:
 *     summary: Delete a property
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     responses:
 *       204:
 *         description: Property deleted successfully
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
 *
 * /properties/{id}/status:
 *   patch:
 *     summary: Update property status
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Property status updated successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: "11111111-1111-1111-1111-111111111111"
 *                 status: "occupied"
 *                 updatedAt: "2025-12-25T00:00:00Z"
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
 *
 * /properties/{id}/template:
 *   get:
 *     summary: Get property template
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
 *         description: Template details
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 templateId: "33333333-3333-3333-3333-333333333333"
 *                 templateOverrides:
 *                   receiptPrefix: "INV"
 *                   receiptCounter: 1024
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 *
 *   put:
 *     summary: Set or update property template
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               templateId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Property updated with template
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: "11111111-1111-1111-1111-111111111111"
 *                 templateId: "33333333-3333-3333-3333-333333333333"
 *                 templateOverrides:
 *                   receiptPrefix: "INV"
 *                   receiptCounter: 1024
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 *
 *   delete:
 *     summary: Remove property template
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
 *         description: Template removed successfully
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
