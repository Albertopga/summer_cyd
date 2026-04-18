-- Migración: trazabilidad de recordatorios de pago en registrations
-- Ejecutar en Supabase SQL Editor

ALTER TABLE public.registrations
ADD COLUMN IF NOT EXISTS last_payment_reminder_sent_at TIMESTAMPTZ;

ALTER TABLE public.registrations
ADD COLUMN IF NOT EXISTS payment_reminder_count INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS registrations_last_payment_reminder_sent_at_idx
  ON public.registrations(last_payment_reminder_sent_at DESC);

COMMENT ON COLUMN public.registrations.last_payment_reminder_sent_at IS
  'Fecha/hora del último email de recordatorio de pago enviado al asistente';

COMMENT ON COLUMN public.registrations.payment_reminder_count IS
  'Número de emails de recordatorio de pago enviados';
