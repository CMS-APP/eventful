import { Alert } from "react-native";

import { containsProfanity } from "./profanity";

export function emailValid(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function nameValid(value: string) {
  return /^[A-Za-z][A-Za-z'-]*$/.test(value);
}

function usernameValid(value: string) {
  return /^(?=.*[A-Za-z])[A-Za-z0-9_.-]+$/.test(value);
}

function fieldLabel(type: string) {
  if (type === "first name") return "First name";
  if (type === "last name") return "Last name";
  return "Username";
}

export function passwordValid(password: string) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_-])[A-Za-z\d!@#$%^&*(),.?":{}|<>_-]{8,}$/g.test(
    password
  );
}

export type NameFieldCheckResult = {
  valid: boolean | null;
  message: string | null;
};

export function checkValue(value: string, type: string): NameFieldCheckResult {
  const label = fieldLabel(type);
  const trimmed = value.trim();
  const minLength = type === "username" ? 3 : 2;

  if (trimmed === "") {
    return {
      valid: null,
      message: `${label} is required.`
    };
  }
  if (trimmed.length < minLength) {
    return {
      valid: false,
      message: `${label} must be at least ${minLength} characters long.`
    };
  }
  if (trimmed.length > 20) {
    return {
      valid: false,
      message: `${label} must be 20 characters or fewer.`
    };
  }
  if (containsProfanity(trimmed)) {
    return {
      valid: false,
      message: `${label} contains a blocked word. Try something else.`
    };
  }
  if (type === "username" && !usernameValid(trimmed)) {
    return {
      valid: false,
      message: `${label} can only use letters, numbers, and underscores, hyphens, and periods. It requires at least 1 letter.`
    };
  }
  if ((type === "first name" || type === "last name") && !nameValid(trimmed)) {
    return {
      valid: false,
      message: `${label} can only use letters, apostrophes, and hyphens.`
    };
  }
  return { valid: true, message: null };
}

export function capitalize(str: string) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function checkNames(
  firstName: string,
  lastName: string,
  username: string
) {
  const firstNameCheck = checkValue(firstName, "first name");
  const lastNameCheck = checkValue(lastName, "last name");
  const usernameCheck = checkValue(username, "username");

  if (
    firstNameCheck?.valid === null &&
    lastNameCheck?.valid === null &&
    usernameCheck?.valid === null
  ) {
    Alert.alert(
      "Missing details",
      "Enter your first name, last name, and username to continue."
    );
    return false;
  }

  if (firstNameCheck?.valid !== true) {
    Alert.alert(
      "Check your first name",
      firstNameCheck?.message ??
        "Please enter a valid first name, last name, and username."
    );
    return false;
  }
  if (lastNameCheck?.valid !== true) {
    Alert.alert(
      "Check your last name",
      lastNameCheck?.message ??
        "Please enter a valid first name, last name, and username."
    );
    return false;
  }
  if (usernameCheck?.valid !== true) {
    Alert.alert(
      "Check your username",
      usernameCheck?.message ??
        "Please enter a valid first name, last name, and username."
    );
    return false;
  }
  return true;
}

export function checkUsernameValid(username: string) {
  if (username.length === 0) {
    return { valid: false, helperText: "Username is required" };
  }

  const result = checkValue(username, "username");
  return {
    valid: result.valid ?? false,
    helperText: result.message ?? ""
  };
}

export function getInitials(firstName: string, lastName: string, name: string) {
  if (firstName && lastName) {
    return `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`;
  }
  return name ? name.charAt(0).toUpperCase() : "?";
}
