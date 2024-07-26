export function selectFromObject(obj, keys) {
  return keys.reduce((newObj, key) => {
      if (obj && obj.hasOwnProperty(key)) {
          newObj[key] = obj[key];
      }
      return newObj;
  }, {});
}
