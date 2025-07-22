const AppError = require("./AppError")

module.exports = function validateFields (fields) {
    for( const [key, value] of Object.entries(fields)) {
        if ( value === undefined || value === null || value === '') {
            throw new AppError(`${key} is required`, 400);
        };
    };
};