
function getBaseUrl(isProductionFlag) {
    return isProductionFlag ? process.env.FRONTEND_PROD_URL : process.env.FRONTEND_URL;
};

module.exports = getBaseUrl;