import { NotFoundException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { ParseIdPipe } from './parse-id.pipe.js';

const pipe = new ParseIdPipe();

describe('ParseIdPipe', () => {
  it.each([
    ['1', 1],
    ['25', 25],
    ['2147483647', 2147483647],
  ])('aceita %s', (input, expected) => {
    expect(pipe.transform(input)).toBe(expected);
  });

  it.each(['abc', '0', '-1', '1.5', '01', '', ' 1', '2147483648', '1e3'])(
    'responde 404 para "%s"',
    (input) => {
      expect(() => pipe.transform(input)).toThrow(NotFoundException);
    },
  );
});
