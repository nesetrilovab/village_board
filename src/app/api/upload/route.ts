import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: [
  'image/jpeg', 
  'image/png', 
  'image/webp', 
  'image/gif',
  'text/plain',                                                               
  'application/pdf',                                                           
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',         
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/msword',                                                        
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',  
],
        tokenPayload: JSON.stringify({}), 
      }),
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log('Upload finished:', blob.url);
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