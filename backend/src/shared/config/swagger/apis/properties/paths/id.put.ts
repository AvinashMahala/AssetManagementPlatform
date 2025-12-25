/**
 * @openapi
 * /properties/{id}:
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
 */
