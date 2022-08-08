import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { Schema } from 'joi';

@Injectable()
export class JoiValidationPipe implements PipeTransform {
  constructor(private schema: Schema) {}

  transform(value: any, _metadata: ArgumentMetadata) {
    const { error } = this.schema.validate(value);

    if (error) {
      //   throw new BadRequestException('Validation failed');

      // return error message to frontend
      throw new BadRequestException(
        error?.details?.[0]?.message || 'Validation failed',
      );
    }
    return value;
  }
}
