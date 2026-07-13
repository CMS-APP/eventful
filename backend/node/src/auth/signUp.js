const { validateEmail } = require("../utils/email");
const { validatePassword } = require("../utils/password");

function mapCreateUserError(error) {
  const code = error && error.code ? error.code : "auth/internal-error";

  switch (code) {
    case "auth/email-already-exists":
      return {
        status: 409,
        code: "EMAIL_ALREADY_EXISTS",
        message: "An account with this email already exists."
      };
    case "auth/invalid-email":
      return {
        status: 400,
        code: "INVALID_EMAIL",
        message: "Please provide a valid email address."
      };
    case "auth/invalid-password":
      return {
        status: 400,
        code: "INVALID_PASSWORD",
        message: "Password does not meet Firebase requirements."
      };
    default:
      return {
        status: 500,
        code: "SIGN_UP_FAILED",
        message: "Unable to create account right now. Please try again."
      };
  }
}

async function signUp({ admin, email, password }) {
  if (!admin || !email || !password) {
    return {
      ok: false,
      status: 400,
      error: {
        code: "MISSING_REQUIRED_FIELDS",
        message: "Email and password are required."
      }
    };
  }

  if (!validateEmail(email)) {
    return {
      ok: false,
      status: 400,
      error: {
        code: "INVALID_EMAIL",
        message: "Please provide a valid email address."
      }
    };
  }

  if (!validatePassword(password)) {
    return {
      ok: false,
      status: 400,
      error: {
        code: "INVALID_PASSWORD",
        message:
          "Password must be at least 8 characters long and contain at least one letter," +
          " one number, and one special character."
      }
    };
  }

  try {
    const userRecord = await admin.auth().createUser({
      email: email.trim().toLowerCase(),
      password
    });

    return {
      ok: true,
      status: 201,
      data: {
        uid: userRecord.uid,
        email: userRecord.email,
        emailVerificationRequired: true
      }
    };
  } catch (error) {
    console.error("signUp error:", error);
    const mappedError = mapCreateUserError(error);
    return {
      ok: false,
      status: mappedError.status,
      error: {
        code: mappedError.code,
        message: mappedError.message
      }
    };
  }
}

module.exports = {
  signUp
};
