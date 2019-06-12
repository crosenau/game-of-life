
/**
 * Scale input number from a domain to range
 * @param {Number} num Number to be scaled
 * @param {Array} domain Min and max values of possible range of inputs
 * @param {Array} range Min and max values of possible range of outputs
 */
export const scale = (num, domain, range) => {
  return (num - domain[0]) * (range[1] - range[0]) / (domain[1] - domain[0]) + range[0];
}

/**
 * Scale input array from a domain to range
 * * Domain and range arrays lengths must match input array length
 * @param {Array} array Array be scaled
 * @param {Array} domain Min and max arrays of possible range of inputs
 * @param {Array} range Min and max arrays of possible range of outputs
 */
export const scaleArray = (arr, domain, range) => {
  const result = [];
  
  for (let x = 0; x < arr.length; x++) {
    result.push(scale(arr[x], [domain[0][x], domain[1][x]], [range[0][x], range[1][x]]))
  }

  return result;
};