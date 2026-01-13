import { NextResponse } from 'next/server';
import versionData from '../../../../version.json';

/**
 * GET /api/version
 * Returns the current application version information
 *
 * Version format: v0.X where X is the commit count
 * Updated: 2026-01-13
 */
export async function GET() {
  return NextResponse.json({
    version: `v${versionData.version}`,
    commit: versionData.commit,
    date: versionData.date,
    environment: process.env.NODE_ENV || 'development'
  });
}
