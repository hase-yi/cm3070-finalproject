import {selectFromObject, formatDate} from "../../utils/misc";

describe('selectFromObject utility function', ()=>{
it('should select specific keys from the object',()=>{
  const obj = {a:1, b:2, c:3};
  const keys = ['a', 'c'];
  const result = selectFromObject(obj, keys);
  expect(result).toEqual({a:1,c:3});
});

it('should ignore keys that do not exist in the object', ()=>{
  const obj = {a:1,b:2};
  const keys = ['a','c'];
  const result = selectFromObject(obj, keys);
  expect(result).toEqual({a:1});
});

it('should return an empty object if the object is empty', ()=>{
  const obj={};
  const keys = ['a','b'];
  const result = selectFromObject(obj,keys);
  expect(result).toEqual({});
});

it('should return an empty object if the object is null or undefined', () => {
  const keys = ['a', 'b'];
  expect(selectFromObject(null, keys)).toEqual({});
  expect(selectFromObject(undefined, keys)).toEqual({});
});

it('should return an empty object if no keys match', () => {
  const obj = { a: 1, b: 2 };
  const keys = ['x', 'y'];
  const result = selectFromObject(obj, keys);
  expect(result).toEqual({});
});
});

describe('formatDate utility function', () => {
  it('should format a valid date string correctly', () => {
    const dateString = '2023-09-04';
    const result = formatDate(dateString);
    expect(result).toBe('September 4, 2023');  // Result may vary depending on your locale
  });

  it('should handle invalid date strings gracefully', () => {
    const dateString = 'invalid-date';
    const result = formatDate(dateString);
    expect(result).toBe('Invalid Date');  // Expected output for invalid dates
  });

  it('should format date from different valid formats', () => {
    const dateString = 'December 17, 1995 03:24:00';
    const result = formatDate(dateString);
    expect(result).toBe('December 17, 1995');  // Format might vary slightly depending on locale
  });

  it('should handle an empty string', () => {
    const dateString = '';
    const result = formatDate(dateString);
    expect(result).toBe('Invalid Date');
  });

  it('should handle undefined or null input', () => {
    expect(formatDate(undefined)).toBe('Invalid Date');
    expect(formatDate(null)).toBe('Invalid Date');
  });
});