import { NextRequest, NextResponse } from 'next/server';
import { dbRepository } from '@/lib/db/repository';

export async function GET() {
  try {
    const evaluations = dbRepository.getAllEvaluations();
    return NextResponse.json({ success: true, evaluations });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
