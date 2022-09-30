import { BadRequestException, ValidationError } from '@nestjs/common';

const getErrors = (
  errors: ValidationError[],
  accumulator = {},
  errorProperty = '',
): any => {
  const customErrors = Array.isArray(errors)
    ? errors.reduce((accumulator, error) => {
        const errorPropertyStr =
          `${errorProperty ? `${errorProperty}.` : ''}` + error.property;
        if (Array.isArray(error.children) && error.children.length === 0) {
          const constraints = Object.keys(error.constraints);
          accumulator[errorPropertyStr] =
            constraints.length > 1
              ? constraints.map((key) => error.constraints[key])
              : error.constraints[Object.values(constraints)[0]];
        } else if (!error.children && error.constraints) {
          // Case, where an key exists in payload which expects to be an array/object
          // but value sent is not expected; eg: a number was received
          const constraints = Object.keys(error.constraints);
          accumulator[errorProperty] =
            constraints.length > 1
              ? constraints.map((key) => error.constraints[key])
              : error.constraints[Object.values(constraints)[0]];
        } else {
          // If the validation error is within an array, handle it
          return getErrors(error.children, accumulator, errorPropertyStr);
        }
        return accumulator;
      }, accumulator)
    : [];
  return customErrors;
};

export const badRequestExceptionFilter = (errors) => {
  const customErrors = getErrors(errors);

  throw new BadRequestException({
    statusCode: 400,
    error: 'Bad Request',
    errors: { ...customErrors },
  });
};
