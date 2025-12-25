/**
 * @openapi
 * /bulk/payments:
 *   post:
 *     summary: Bulk payment recording for multiple transactions
 *     tags: [Bulk Operations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
		responses:
			200:
				description: Bulk payment recording completed
				content:
					application/json:
						schema:
							$ref: '#/components/schemas/BulkOperationResult'
						example:
							success: true
							message: "Bulk payment recording completed"
							processed: 5
							failed: 0
							errors: []
			207:
				description: Bulk payment recording completed with errors
				content:
					application/json:
						schema:
							$ref: '#/components/schemas/BulkOperationResult'
						example:
							success: false
							message: "Bulk payment recording completed with errors"
							processed: 5
							failed: 1
							errors:
								- index: 2
									itemId: "txn-456"
									message: "Duplicate transaction"
			401:
				$ref: '#/components/responses/BadRequest'
			500:
				$ref: '#/components/responses/InternalError'
 *               processed: 5
