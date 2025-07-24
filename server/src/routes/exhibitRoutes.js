// --------------------------------------IMPORT---------------------------------------
// Import dependencies
const express = require('express');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Import controllers
const audioController = require('../controllers/audioController');
const jwtMiddleware = require('../middlewares/jwtMiddleware');
const rateLimiter = require('../middlewares/rateLimiter');
const exhibitController = require('../controllers/exhibitController')

// -----------------------------------SET UP ROUTES-----------------------------------
// Create the router
const audioRouter = express.Router();

audioRouter.use(jwtMiddleware.verifyToken)

// Admin Exhibit Routes
router.post('/create-exhibit', exhibitController.createExhibit);             // -- C
router.get('/get-byId/:exhibitId', exhibitController.getSingleExhibit);     // -- R
router.put('/update-exhibit', exhibitController.updateExhibit);            // -- U
router.delete('/delete/:exhibitId', exhibitController.deleteExhibit);     // -- D

router.get('/get-exhibits', exhibitController.getAllExhibits);



module.exports = audioRouter;
