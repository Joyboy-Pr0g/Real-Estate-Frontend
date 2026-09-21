import { z } from 'zod';

export const submitContactBodySchema = z.object({
  full_name: z.string().trim().min(2, 'الاسم الكامل مطلوب').max(200),
  email: z.string().trim().email('البريد الإلكتروني غير صالح').max(255),
  subject: z.string().trim().min(3, 'الموضوع قصير جداً').max(200),
  message: z.string().trim().min(10, 'الرسالة قصيرة جداً').max(4000),
});

export const replyContactBodySchema = z.object({
  reply_message: z.string().trim().min(1, 'نص الرد مطلوب').max(4000),
});
