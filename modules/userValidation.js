function validateRegisterInput(username, email, password) {
  // Trim inputs to handle whitespace
  const trimmedUsername = username ? username.trim() : '';
  const trimmedEmail = email ? email.trim() : '';

  // Check for empty fields
  if (!trimmedUsername || !trimmedEmail || !password) {
    return { isValid: false, error: 'All fields are required' };
  }

  // Validate lengths
  if (trimmedUsername.length > 25) {
    return { isValid: false, error: 'Username must be 25 characters or less' };
  }
  if (trimmedEmail.length > 254) {
    return { isValid: false, error: 'Email must be 254 characters or less' };
  }
  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters' };
  }

  // Validate email format
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  if (!emailRegex.test(trimmedEmail)) {
    return { isValid: false, error: 'Invalid email format' };
  }

  // Validate username format (alphanumeric and underscores only)
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!usernameRegex.test(trimmedUsername)) {
    return { isValid: false, error: 'Username can only contain letters, numbers, and underscores' };
  }

  return { isValid: true, trimmedUsername, trimmedEmail };
}

function validateLoginInput(username, password) {
  // Trim inputs to handle whitespace
  const trimmedUsername = username ? username.trim() : '';

  // Check for empty fields
  if (!trimmedUsername || !password) {
    return { isValid: false, error: 'Username and password are required' };
  }

  // Validate username length
  if (trimmedUsername.length > 25) {
    return { isValid: false, error: 'Username must be 25 characters or less' };
  }

  // Validate username format (alphanumeric and underscores only)
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!usernameRegex.test(trimmedUsername)) {
    return { isValid: false, error: 'Username can only contain letters, numbers, and underscores' };
  }

  // Validate password length
  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters' };
  }

  return { isValid: true, trimmedUsername };
}

module.exports = { validateRegisterInput, validateLoginInput };