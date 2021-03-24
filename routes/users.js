const express = require('express');
var router = express.Router();
var userController = require('../controllers/user_controller');
const auth = require('../_helpers/authentication');
/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Login.
 *     description: Enter username and password, receive a token in return which you can use for the rest of the routes. Token expires in 1 hour.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:  
 *                 type: string
 *                 required: true
 *                 example: TestUser
 *               password:
 *                 type: string
 *                 required: true
 *                 example: 123456 (minimum 6 characters)
 *     responses:
 *       200:
 *         description: User successfully Logged In
*/

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Create a user.
 *     description: Enter username and password, enter password 2 to validate they are the same, and the role of the user. Roles= 'bruger','administrator', 'hotelmanager', 'guest'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 required: true
 *                 example: TestUser1
 *               password:
 *                 type: string
 *                 required: true
 *                 example: 123456 (minimum 6 characters)
 *               password2: 
 *                 type: string
 *                 required: true
 *                 example: 123456 (minimum 6 characters)
 *               role: 
 *                 type: string
 *                 required: false
 *                 example: guest
 *     responses:
 *       200:
 *         description: Successfully Created User
*/

 /**
 * @swagger
 * /users/changerole:
 *   post:
 *     security:
 *     - bearerAuth: []
 *     summary: Change role of a user.
 *     description: Enter admin username, and the username of the account you want to change to hotelmanager. Provide your token to validate that you are logged in.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 required: true
 *               usernameToChange: 
 *                 type: string
 *                 required: true
 *                 example: TestUser1
 *     responses:
 *       200:
 *         description: Successfully changed role of user.
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


//Post login
router.post('/login', userController.login);

//Post register
router.post('/register', userController.register);

//Post changerole
router.post('/changerole', auth.authenticateJWT, userController.changeRole);


module.exports = router;