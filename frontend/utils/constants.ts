export const formRegex = {
  email: /\w+@\w+\.\w+/,
  password: /.{6,}/,
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
};
