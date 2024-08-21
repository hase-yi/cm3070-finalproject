export function selectFromObject(obj, keys) {
  return keys.reduce((newObj, key) => {
      if (obj && obj.hasOwnProperty(key)) {
          newObj[key] = obj[key];
      }
      return newObj;
  }, {});
}

export function formatDate(dateString) {
  if(!dateString){
    return 'Invalid Date';
  }
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const date = new Date(dateString);
  if(isNaN(date.getTime())){
    return 'Invalid Date';
  }
  return date.toLocaleDateString(undefined, options);
}

