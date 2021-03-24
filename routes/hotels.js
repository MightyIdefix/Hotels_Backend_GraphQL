const express = require('express');
var router = express.Router();
var hotelController = require('../controllers/hotels_controller');
const auth = require('../_helpers/authentication');

/**
 * @swagger
 * /hotels/addhotel:
 *   post:
 *     security:
 *     - bearerAuth: []
 *     summary: Add a new hotel.
 *     description: Add a new hotel.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: 
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the hotel to add
 *                 example: TestHotel4
 *     responses:
 *       405:
 *          description: "invalid input"
 * 
 * definitions:
 *   Hotel:
 *     type: object
 *     properties:
 *       name:
 *         type: string
 *         description: The name of the hotel.
 *         example: HotelCalifornia
 *       rooms:
 *         type: array
 *         items:
 *           type: object
 *           properties:
 *             number:
 *               type: integer
 *               desctiption: Number of the room
 *             occupied:
 *               type: boolean
 *               description: defines if the room is rented
 *             guests:
 *               type: array
 *               description: list of all guests currently renting the room
 *               items:
 *                 type: object
 *                 properties: 
 *                   guestID:
 *                     type: int
 *                     description: ID reference to users
 *       hotelManager:
 *         type: object
 *         description: A manager can create new Hotels, and new rooms in these.
 *         properties:
 *           userID:
 *             type: int
 *             description: ID reference to users
 *  
 * components:  
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       name: Authorization
 *       scheme: bearer
 *       bearerFormat: JWT
 * 
 * security:
 * - bearerAuth: []
 */

//Post add hotel
router.post('/addhotel', auth.authenticateJWT , hotelController.addhotel);

module.exports = router;