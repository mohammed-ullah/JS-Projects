const { add, subtract, multiply, divide } = require('../../src/calculator');

describe('Calculator Functions', () => {
    describe('add', () => {
        test('should add two positive numbers', () => {
            expect(add(2, 3)).toBe(5);
        });
        
        test('should add negative numbers', () => {
            expect(add(-2, -3)).toBe(-5);
        });
        
        test('should add zero', () => {
            expect(add(5, 0)).toBe(5);
        });
        
        test('should throw error for non-numbers', () => {
            expect(() => add('2', 3)).toThrow('Both arguments must be numbers');
        });
    });
    
    describe('subtract', () => {
        test('should subtract numbers correctly', () => {
            expect(subtract(5, 3)).toBe(2);
        });
        
        test('should handle negative results', () => {
            expect(subtract(3, 5)).toBe(-2);
        });
    });
    
    describe('multiply', () => {
        test('should multiply positive numbers', () => {
            expect(multiply(3, 4)).toBe(12);
        });
        
        test('should multiply by zero', () => {
            expect(multiply(5, 0)).toBe(0);
        });
        
        test('should multiply negative numbers', () => {
            expect(multiply(-2, 3)).toBe(-6);
        });
    });
    
    describe('divide', () => {
        test('should divide numbers correctly', () => {
            expect(divide(10, 2)).toBe(5);
        });
        
        test('should handle decimal results', () => {
            expect(divide(10, 3)).toBeCloseTo(3.333, 3);
        });
        
        test('should throw error for division by zero', () => {
            expect(() => divide(10, 0)).toThrow('Cannot divide by zero');
        });
        
        test('should throw error for non-numbers', () => {
            expect(() => divide(10, '2')).toThrow('Both arguments must be numbers');
        });
    });
});
