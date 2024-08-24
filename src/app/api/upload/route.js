import { NextResponse } from 'next/server';
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "@/utils/s3";
import { sqsClient } from '@/utils/sqs';
import { createClient } from "@/utils/supabase/server";
import { SendMessageCommand } from "@aws-sdk/client-sqs";

export async function POST(request) {
  const { input_request, file_metadata, file_type } = await request.json();
  // Check Supabase authentication
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    //CREATE THE TRANSACTION IN DB
    const { data, error } = await supabase
      .from('Transactions')
      .insert([
        {
          user_id: user.id,
          input_request: input_request,
          file_metadata: file_metadata,
        },
      ])
      .select()
      .single()
    if (error)
      throw error

    // GET SIGNED URL TO PUT DATA
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `${data.user_id}/${data.id}`,
      ContentType: file_metadata['type'],
    });
    //created a signed url to upload data to (expired in 5 minutes)
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
    // UPDATE DB WITH THE NEW LOCATION
    const updated_res = await supabase
      .from('Transactions')
      .update({ "media_key": `${data.user_id}/${data.id}` })
      .eq('id', data.id)
      .select()
      .single()

    if (updated_res.error)
      throw updated_res.error;

    // SEND THE SQS MESSAGE WITH THE TRANSACTION ID 
    const sqsCommand = new SendMessageCommand({
      QueueUrl: process.env.SQS_QUEUE_URL,
      MessageBody: JSON.stringify(
        {
          transactionId: data.id,
        }
      )
    });

    await sqsClient.send(sqsCommand);


    return NextResponse.json({ signedUrl });

  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Error generating signed URL or saving metadata" }, { status: 500 });
  }
}