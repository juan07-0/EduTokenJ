import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { storageService } from './storageService';
import {
  AccessKey,
  Exam,
  ExamSubmission,
  IssuedCertificate,
} from '../types/lms';

// Read from Vite environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) safely
const envUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) as string | undefined;
const envAnonKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) as string | undefined;

let supabaseInstance: SupabaseClient | null = null;

/**
 * Initializes and returns the Supabase client using environment variables
 * with fallback to administrative localStorage settings.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;

  const localConfig = storageService.getSupabaseConfig();
  const targetUrl = envUrl || localConfig.supabaseUrl;
  const targetKey = envAnonKey || localConfig.anonKey;

  if (targetUrl && targetKey && targetUrl.startsWith('http')) {
    try {
      supabaseInstance = createClient(targetUrl, targetKey);
      return supabaseInstance;
    } catch (err) {
      console.warn('Error instantiating Supabase client:', err);
      return null;
    }
  }

  return null;
}

export function resetSupabaseClient(): void {
  supabaseInstance = null;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseClient());
}

/**
 * Tests connection to a Supabase project and verifies if schema tables exist.
 */
export async function testSupabaseConnection(
  url: string,
  anonKey: string
): Promise<{ success: boolean; message: string; tablesExist: boolean }> {
  if (!url || !anonKey) {
    return {
      success: false,
      message: 'Debes proporcionar la URL del proyecto y la Anon Key.',
      tablesExist: false,
    };
  }

  try {
    const client = createClient(url, anonKey);

    // Try reading from keys or access_keys table
    const { data, error } = await client.from('keys').select('id').limit(1);

    if (error) {
      // 42P01 = table does not exist
      if (error.code === '42P01') {
        // Try fallback to access_keys view/table
        const altCheck = await client.from('access_keys').select('id').limit(1);
        if (!altCheck.error) {
          return {
            success: true,
            message: '¡Conexión verificada con éxito a Supabase (tablas activas)!',
            tablesExist: true,
          };
        }

        return {
          success: true,
          message: '¡Conectado a Supabase! (Falta ejecutar el script SQL supabase_schema.sql en el SQL Editor).',
          tablesExist: false,
        };
      }

      return {
        success: false,
        message: `Error de Supabase: ${error.message} (${error.code || 'Verifica tus credenciales'})`,
        tablesExist: false,
      };
    }

    return {
      success: true,
      message: '¡Conectado exitosamente a Supabase con tablas activas!',
      tablesExist: true,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `No se pudo conectar: ${err.message || 'Error de red o URL inválida'}`,
      tablesExist: false,
    };
  }
}

/**
 * Pushes local keys to the Supabase "keys" table (upsert).
 */
export async function syncLocalKeysToSupabase(): Promise<{ success: boolean; count: number; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, count: 0, error: 'Supabase no está configurado.' };
  }

  try {
    const localKeys = storageService.getKeys();
    const rows = localKeys.map((k) => ({
      key_code: k.keyCode,
      student_name: k.studentName || 'Estudiante',
      role: k.role,
      grade: k.grade || null,
      allowed_periods: k.allowedPeriods,
      allowed_subjects: k.allowedSubjects,
      is_active: k.isActive,
      created_at: k.createdAt,
      last_login_at: k.lastLoginAt || null,
    }));

    // Try upserting into 'keys' (or fallback to 'access_keys')
    let { error } = await client.from('keys').upsert(rows, { onConflict: 'key_code' });
    if (error && error.code === '42P01') {
      const alt = await client.from('access_keys').upsert(rows, { onConflict: 'key_code' });
      error = alt.error;
    }

    if (error) throw error;
    return { success: true, count: rows.length };
  } catch (err: any) {
    return { success: false, count: 0, error: err.message || 'Error al sincronizar con Supabase' };
  }
}

/**
 * Fetches keys from Supabase and merges them with local storage.
 */
export async function fetchKeysFromSupabase(): Promise<AccessKey[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    let { data, error } = await client.from('keys').select('*');
    if (error && error.code === '42P01') {
      const alt = await client.from('access_keys').select('*');
      data = alt.data;
      error = alt.error;
    }

    if (error || !data) return null;

    const formatted: AccessKey[] = data.map((row: any) => ({
      id: row.id,
      keyCode: row.key_code,
      role: row.role,
      studentName: row.student_name,
      grade: row.grade,
      allowedPeriods: row.allowed_periods || [1, 2, 3],
      allowedSubjects: row.allowed_subjects || [],
      isActive: Boolean(row.is_active),
      createdAt: row.created_at || new Date().toISOString(),
      lastLoginAt: row.last_login_at || undefined,
    }));

    return formatted;
  } catch (err) {
    console.warn('Error fetching keys from Supabase:', err);
    return null;
  }
}

/**
 * Saves an exam submission to Supabase 'results' table.
 */
export async function saveResultToSupabase(submission: ExamSubmission): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const row = {
      key_code: submission.keyCode,
      student_name: submission.studentName,
      grade: submission.grade,
      period: submission.period,
      subject: submission.subject,
      score: submission.score,
      total_points_earned: submission.totalPointsEarned,
      total_points_possible: submission.totalPointsPossible,
      passed: submission.passed,
      answers: submission.answers,
      ai_feedback: submission.aiFeedback || {},
      submitted_at: submission.submittedAt,
    };

    let { error } = await client.from('results').insert(row);
    if (error && error.code === '42P01') {
      const alt = await client.from('exam_submissions').insert(row);
      error = alt.error;
    }

    return !error;
  } catch {
    return false;
  }
}

/**
 * Saves an issued certificate to Supabase 'certificates' table.
 */
export async function saveCertificateToSupabase(cert: IssuedCertificate): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const row = {
      verification_code: cert.verificationCode,
      student_name: cert.studentName,
      grade: cert.grade,
      period: cert.period,
      subject: cert.subject,
      subject_name: cert.subjectName,
      score: cert.score,
      institution_name: cert.institutionName,
      rector_name: cert.rectorName,
      issued_at: cert.issuedAt,
    };

    let { error } = await client.from('certificates').upsert(row, { onConflict: 'verification_code' });
    if (error && error.code === '42P01') {
      const alt = await client.from('issued_certificates').upsert(row, { onConflict: 'verification_code' });
      error = alt.error;
    }

    return !error;
  } catch {
    return false;
  }
}
