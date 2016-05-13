
export function getPropertyValue(obj: any, ...keys): string {
  var current = obj;
  /*console.log('keys');
  console.log(keys);
  console.log('obj');
  console.log(obj);*/
  keys.forEach(elt => {
    if (current) {
	  current = current[elt];
    }
  });
  return current;
};