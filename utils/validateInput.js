import validator from 'validator';

export const validateRegisterInput = ({ username, email, password, confirmPassword }) => {
  const errors = {};

  if (!username || !/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.username = 'Username is required and must be alphanumeric.';
  }

  if (!email || !validator.isEmail(email)) {
    errors.email = 'A valid email is required.';
  }

  if (
    !password ||
    password.length < 8 ||
    !/[A-Z]/.test(password) ||
    !/[a-z]/.test(password) ||
    !/[0-9]/.test(password) ||
    !/[^A-Za-z0-9]/.test(password)
  ) {
    errors.password =
      'Password must be at least 8 characters long and include uppercase, lowercase, number, and symbol.';
  }

  if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  return {
    errors,
    valid: Object.keys(errors).length === 0,
  };
};
