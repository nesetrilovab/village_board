import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        tokenPayload: JSON.stringify({}), // Tady můžeš později přidat ID uživatele
      }),
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Tato část se spustí, až bude soubor bezpečně v cloudu
        console.log('Upload dokončen:', blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}