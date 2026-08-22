import { z } from 'zod';
import type { TranslationKey } from '@/lib/i18n/ar';

export type SchemaTranslate = (key: TranslationKey) => string;

function createPasswordFieldSchema(t: SchemaTranslate) {
  return z
    .string()
    .min(8, t('validation.min8Chars'))
    .max(128)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/,
      t('validation.passwordComplexity'),
    );
}

export function createLoginSchema(t: SchemaTranslate) {
  return z.object({
    email: z.string().trim().email(t('validation.invalidEmail')),
    password: z.string().min(1, t('validation.passwordRequired')),
  });
}

export type LoginInput = z.infer<ReturnType<typeof createLoginSchema>>;

export const loginBodySchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export function createRegisterSchema(t: SchemaTranslate) {
  return z
    .object({
      f_name: z.string().trim().min(2, t('validation.firstNameMin')).max(20),
      l_name: z.string().trim().min(2, t('validation.lastNameMin')).max(20),
      email: z.string().trim().email(t('validation.invalidEmail')),
      phone_number: z
        .string()
        .trim()
        .regex(/^\+?[\d\s\-()]+$/, t('validation.invalidPhone'))
        .min(7, t('validation.invalidPhone'))
        .max(20),
      password: createPasswordFieldSchema(t),
      password_confirmation: z.string().min(1, t('validation.confirmPasswordRequired')),
    })
    .refine((data) => data.password === data.password_confirmation, {
      message: t('validation.passwordsNoMatch'),
      path: ['password_confirmation'],
    });
}

export type RegisterInput = z.infer<ReturnType<typeof createRegisterSchema>>;

export const registerBodySchema = z
  .object({
    f_name: z.string().trim().min(2).max(20),
    l_name: z.string().trim().min(2).max(20),
    email: z.string().trim().email(),
    phone_number: z
      .string()
      .trim()
      .regex(/^\+?[\d\s\-()]+$/)
      .min(7)
      .max(20),
    password: z
      .string()
      .min(8)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/),
    password_confirmation: z.string().min(1),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Password confirmation does not match',
    path: ['password_confirmation'],
  });

export const AdminCreateUserSchema = z.object({
  f_name: z.string().trim().min(2).max(20),
  l_name: z.string().trim().min(2).max(20),
  email: z.string().trim().email(),
  phone_number: z.string().trim().regex(/^\+?[\d\s\-()]+$/).min(7).max(20),
  role: z.enum(['buyer', 'office', 'platform_admin']),
});

export function createVerifyEmailSchema(t: SchemaTranslate) {
  return z.object({
    email: z.string().trim().email(t('validation.invalidEmail')),
    code: z
      .string()
      .trim()
      .length(6, t('validation.code6Digits'))
      .regex(/^\d{6}$/, t('validation.code6Digits')),
  });
}

export type VerifyEmailInput = z.infer<ReturnType<typeof createVerifyEmailSchema>>;

export const verifyEmailBodySchema = z.object({
  email: z.string().trim().email(),
  code: z.string().trim().min(1),
});

export function createForgotPasswordSchema(t: SchemaTranslate) {
  return z.object({
    email: z.string().trim().email(t('validation.invalidEmail')),
  });
}

export type ForgotPasswordInput = z.infer<ReturnType<typeof createForgotPasswordSchema>>;

export const forgotPasswordBodySchema = z.object({
  email: z.string().trim().email(),
});

export function createChangePasswordSchema(t: SchemaTranslate) {
  return z
    .object({
      current_password: z.string().min(1, t('validation.currentPasswordRequired')),
      new_password: createPasswordFieldSchema(t),
      new_password_confirmation: z.string().min(1, t('validation.confirmPasswordRequired')),
    })
    .refine((data) => data.new_password === data.new_password_confirmation, {
      message: t('validation.passwordsNoMatch'),
      path: ['new_password_confirmation'],
    });
}

export type ChangePasswordInput = z.infer<ReturnType<typeof createChangePasswordSchema>>;

export const changePasswordBodySchema = z
  .object({
    current_password: z.string().min(1),
    new_password: z
      .string()
      .min(8)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/),
    new_password_confirmation: z.string().min(1),
  })
  .refine((data) => data.new_password === data.new_password_confirmation, {
    message: 'Password confirmation does not match',
    path: ['new_password_confirmation'],
  });

export function createSendCodeSchema(t: SchemaTranslate) {
  return z.object({
    email: z.string().trim().email(t('validation.invalidEmail')),
  });
}

export type SendCodeInput = z.infer<ReturnType<typeof createSendCodeSchema>>;

export const sendCodeBodySchema = z.object({
  email: z.string().trim().email(),
});

export const sendRoleBodySchema = z.object({
  role: z.enum(['buyer', 'office']),
});

/** @deprecated Use sendRoleBodySchema */
export const sendRoleBodSchema = sendRoleBodySchema;

export const refreshTokenBodySchema = z.object({
  refreshToken: z.string().trim().min(1),
});

export const createUserSchema = registerBodySchema;

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const adminUserSearchSchema = z.object({
  role: z.enum(['buyer', 'office', 'platform_admin']).optional(),
  status: z.enum(['active', 'inactive', 'blocked']).optional(),
  search: z.string().trim().max(100).optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  include_deleted: z
    .enum(['true', 'false'])
    .optional()
    .transform((value) => value === 'true'),
});
