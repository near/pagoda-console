import { BN } from 'bn.js';

export const U128 = new BN('2', 10).pow(new BN('128', 10)).sub(new BN('1', 10)); // Max yoctoNEAR allowed in a state change

export const formRegex = {
  contractAddressWildcard: /^(([a-z\d\*]+[\-_])*[a-z\d\*]+\.)*([a-z\d]+[\-_])*[a-z\d]+$/,
  contractAddress: /^(([a-z\d]+[\-_])*[a-z\d]+\.)*([a-z\d]+[\-_])*[a-z\d]+$/,
  email: /^(.+)@(.+)[^.]$/,
  password: /.{6,}/,
  url: /^https:\/\/.+\..+/,
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
    pattern: {
      value: formRegex.password,
      message: 'Password must be at least 6 characters',
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
