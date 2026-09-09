import { NextResponse } from 'next/server';

export async function withMutationRevalidate(
  response: NextResponse,
  revalidate: () => void,
): Promise<NextResponse> {
  try {
    const body = await response.clone().json();
    if (body?.success) {
      revalidate();
    }
  } catch {
    // Response may not be JSON on hard failures.
  }

  return response;
}
