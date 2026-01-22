export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  email?: boolean;
  custom?: (value: any) => string | null;
}

export interface ValidationErrors {
  [key: string]: string;
}

export function validateField(value: any, rules: ValidationRule): string | null {
  if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
    return 'Ce champ est requis.';
  }

  if (value && typeof value === 'string') {
    if (rules.minLength && value.length < rules.minLength) {
      return `Minimum ${rules.minLength} caractères.`;
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      return `Maximum ${rules.maxLength} caractères.`;
    }

    if (rules.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Adresse email invalide.';
    }

    if (rules.pattern && !rules.pattern.test(value)) {
      return 'Format invalide.';
    }
  }

  if (typeof value === 'number') {
    if (rules.min !== undefined && value < rules.min) {
      return `La valeur minimum est ${rules.min}.`;
    }

    if (rules.max !== undefined && value > rules.max) {
      return `La valeur maximum est ${rules.max}.`;
    }
  }

  if (rules.custom) {
    return rules.custom(value);
  }

  return null;
}

export function validateForm<T extends Record<string, any>>(
  data: T,
  rules: { [K in keyof T]?: ValidationRule }
): ValidationErrors {
  const errors: ValidationErrors = {};

  for (const key in rules) {
    const rule = rules[key];
    if (rule) {
      const error = validateField(data[key], rule);
      if (error) {
        errors[key] = error;
      }
    }
  }

  return errors;
}

// Common validation rules
export const commonRules = {
  email: {
    required: true,
    email: true,
  },
  password: {
    required: true,
    minLength: 8,
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 255,
  },
  phone: {
    pattern: /^(\+33|0)[1-9](\d{2}){4}$/,
  },
  postalCode: {
    pattern: /^\d{5}$/,
  },
};

// Password strength checker
export function checkPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 2) {
    return { score, label: 'Faible', color: 'bg-rose-500' };
  } else if (score <= 4) {
    return { score, label: 'Moyen', color: 'bg-amber-500' };
  } else {
    return { score, label: 'Fort', color: 'bg-emerald-500' };
  }
}
