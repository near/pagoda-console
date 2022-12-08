import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';

const emptyObject = z.strictObject({});

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: z.Schema) {}

  transform(value: unknown, _metadata: ArgumentMetadata) {
    let validateSchema = this.schema;
    if (this.schema instanceof z.ZodVoid) {
      validateSchema = emptyObject;
    }
    const parsedValue = validateSchema.safeParse(value);
    if (parsedValue.success === false) {
      throw new BadRequestException(fromZodError(parsedValue.error).toString());
    }
    return parsedValue.data;
  }
}
