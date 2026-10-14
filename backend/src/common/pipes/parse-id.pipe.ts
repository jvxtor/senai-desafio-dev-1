import { Injectable, NotFoundException, PipeTransform } from '@nestjs/common';

const MAX_INT = 2_147_483_647;
const POSITIVE_INTEGER = /^[1-9]\d*$/;

@Injectable()
export class ParseIdPipe implements PipeTransform<string, number> {
  transform(value: string): number {
    if (!POSITIVE_INTEGER.test(value) || Number(value) > MAX_INT) {
      throw new NotFoundException('Recurso não encontrado.');
    }
    return Number(value);
  }
}
