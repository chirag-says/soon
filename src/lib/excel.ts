// Excel and CSV parsing utilities
// Extracts ONLY Name and Email columns — all other data is discarded

import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import type { Recipient } from './validation';

/**
 * Finds the column index/key for Name and Email columns.
 * Handles various common header variations case-insensitively.
 */
const NAME_HEADERS = ['name', 'full name', 'fullname', 'first name', 'firstname', 'recipient name', 'member name', 'alumni name'];
const EMAIL_HEADERS = ['email', 'e-mail', 'email address', 'emailaddress', 'mail', 'email id', 'emailid'];

function findColumnKey(headers: string[], candidates: string[]): string | null {
  for (const header of headers) {
    const normalized = header.trim().toLowerCase();
    if (candidates.includes(normalized)) {
      return header;
    }
  }
  return null;
}

/**
 * Parses an Excel file (.xlsx, .xls) and extracts ONLY name and email.
 * All other columns are completely ignored and never retained.
 */
export function parseExcel(buffer: ArrayBuffer): { recipients: { name?: string; email?: string }[]; error?: string } {
  try {
    const workbook = XLSX.read(buffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      return { recipients: [], error: 'The Excel file contains no sheets.' };
    }

    const sheet = workbook.Sheets[firstSheetName];
    const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });

    if (jsonData.length === 0) {
      return { recipients: [], error: 'The Excel file contains no data rows.' };
    }

    const headers = Object.keys(jsonData[0]);
    const nameKey = findColumnKey(headers, NAME_HEADERS);
    const emailKey = findColumnKey(headers, EMAIL_HEADERS);

    if (!emailKey) {
      return { recipients: [], error: 'Could not find an "Email" column. Please ensure your file has a column named "Email".' };
    }

    // Extract ONLY name and email — discard everything else
    const recipients = jsonData.map((row) => ({
      name: nameKey ? String(row[nameKey] || '').trim() : '',
      email: String(row[emailKey] || '').trim(),
    }));

    return { recipients };
  } catch {
    return { recipients: [], error: 'Failed to parse the Excel file. Please ensure it is a valid .xlsx or .xls file.' };
  }
}

/**
 * Parses a CSV file and extracts ONLY name and email.
 * All other columns are completely ignored and never retained.
 */
export function parseCSV(text: string): { recipients: { name?: string; email?: string }[]; error?: string } {
  try {
    const result = Papa.parse<Record<string, string>>(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h: string) => h.trim(),
    });

    if (result.errors.length > 0 && result.data.length === 0) {
      return { recipients: [], error: 'Failed to parse the CSV file. Please check the file format.' };
    }

    if (result.data.length === 0) {
      return { recipients: [], error: 'The CSV file contains no data rows.' };
    }

    const headers = result.meta.fields || [];
    const nameKey = findColumnKey(headers, NAME_HEADERS);
    const emailKey = findColumnKey(headers, EMAIL_HEADERS);

    if (!emailKey) {
      return { recipients: [], error: 'Could not find an "Email" column. Please ensure your file has a column named "Email".' };
    }

    // Extract ONLY name and email — discard everything else
    const recipients = result.data.map((row) => ({
      name: nameKey ? String(row[nameKey] || '').trim() : '',
      email: String(row[emailKey] || '').trim(),
    }));

    return { recipients };
  } catch {
    return { recipients: [], error: 'Failed to parse the CSV file. Please check the file format.' };
  }
}

/**
 * Detects file type and parses accordingly.
 * Returns ONLY name and email for each row.
 */
export async function parseFile(file: File): Promise<{ recipients: { name?: string; email?: string }[]; error?: string }> {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith('.csv')) {
    const text = await file.text();
    return parseCSV(text);
  }

  if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
    const buffer = await file.arrayBuffer();
    return parseExcel(buffer);
  }

  return { recipients: [], error: 'Unsupported file format. Please upload a .csv, .xlsx, or .xls file.' };
}
