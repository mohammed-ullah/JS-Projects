const { add, subtract, multiply, divide } = require('../src/calculator');

describe('Calculator Functions', () => {
    test('add function should return sum of two numbers', () => {
        expect(add(2, 3)).toBe(5);  // Testing the add function
    });

    test('subtract function should return difference', () => {
        expect(subtract(5, 3)).toBe(2);  // Testing the subtract function
    });

    test('divide should throw error for zero', () => {
        expect(() => divide(10, 0)).toThrow('Cannot divide by zero');
    });
});