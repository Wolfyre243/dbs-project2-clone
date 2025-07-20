// Formats all date objects in an object from Prisma into ISO strings
function convertDatesToStrings(obj) {
  if (Array.isArray(obj)) {
    return obj.map(convertDatesToStrings);
  } else if (obj && typeof obj === 'object') {
    const newObj = {};
    for (const key in obj) {
      if (obj[key] instanceof Date) {
        newObj[key] = obj[key].toISOString();
      } else {
        newObj[key] = convertDatesToStrings(obj[key]);
      }
    }
    return newObj;
  }
  return obj;
}

module.exports = {
  convertDatesToStrings,
};
