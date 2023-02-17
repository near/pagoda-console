import JSBI from 'jsbi';

export const U128 = JSBI.subtract(JSBI.exponentiate(JSBI.BigInt('2'), JSBI.BigInt('128')), JSBI.BigInt('1')); // Max yoctoNEAR allowed in a state change

export const formRegex = {
  contractAddressWildcard:
    /^((([a-z\d\*]+[\-_])*[a-z\d\*]+\.)*(([a-z\d]+[\-_])*[a-z\d]+\.)+)*([a-z\d]+[\-_])*[a-z\d]+$/,
  contractAddress: /^(([a-z\d]+[\-_])*[a-z\d]+\.)*([a-z\d]+[\-_])*[a-z\d]+$/,
  email: /^(.+)@(.+)[^.]$/,
  // requires to use strong passwords
  password: new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})'),
  url: /^https:\/\/.+\..+/,
};

export const passwordValidation = {
  minLength: /.{8,}/,
  containNumber: /\d/,
  lowerCase: /[a-z]/,
  upperCase: /[A-Z]/,
  specialCharacter: /[!@#\$%\^&\*]/,
};

export const formValidations = {
  displayName: {
    required: 'Please enter a display name',
    maxLength: {
      value: 50,
      message: 'Display name must be 50 characters or less',
    },
  },
  email: {
    required: 'Please enter an email address',
    pattern: {
      value: formRegex.email,
      message: 'Please enter a valid email address',
    },
  },
  password: {
    required: 'Please enter a password',
    validate: {
      minLength: (value: string) =>
        passwordValidation.minLength.test(value) || 'Password must be at least 8 characters',
      containNumber: (value: string) =>
        passwordValidation.containNumber.test(value) || 'Password must contain at least one number',
      lowerCaseLetter: (value: string) =>
        passwordValidation.lowerCase.test(value) || 'Password must contain at least one lowercase letter',
      upperCaseLetter: (value: string) =>
        passwordValidation.upperCase.test(value) || 'Password must contain at least one uppercase letter',
      extraSymbol: (value: string) =>
        passwordValidation.specialCharacter.test(value) ||
        'Password must contain at least one special character like !, @, %, &, *',
    },
  },
  projectName: {
    required: 'Please enter a project name',
    maxLength: {
      value: 50,
      message: 'Project names cannot be longer than 50 characters',
    },
  },
  url: {
    required: 'Please enter a URL',
    pattern: {
      value: formRegex.url,
      message: 'Please enter a valid URL including scheme: https://example.com',
    },
  },
};
