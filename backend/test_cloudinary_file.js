import 'dotenv/config';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const run = async () => {
  try {
    const fakeBase64 = 'data:application/pdf;base64,JVBERi0xLjQKJcOkw7zDtsOfCjIgMCBvYmoKPDwvTGVuZ3RoIDMgMCBSL0ZpbHRlci9GbGF0ZURlY29kZT4+CnN0cmVhbQp4nDPQM1Qo5ypUMFAwALJMLU31jBQsTAz1LBSK0osS8/JzU4uVrCyB/BIli5y85JxU3eK80twcBSB3CFCKxWkKJYpFKalFJZl5qUBD0xQA41gWOQplbmRzdHJlYW0KZW5kb2JqCgozIDAgb2JqCjg3CmVuZG9iagoKMSAwIG9iago8PC9QYWdlcyA0IDAgUi9UeXBlL0NhdGFsb2c+PgplbmRvYmoKCjUgMCBvYmoKPDwvQ3JlYXRpb25EYXRlKEQ6MjAxOTA4MjQxNTEyMjIrMDInMDAnKS9DcmVhdG9yKFBERmNyZWF0b3IpL1Byb2R1Y2VyKFBERmNyZWF0b3IpPj4KZW5kb2JqCgo2IDAgb2JqCjw8L0ZvbnQ8PC9GMSA4IDAgUj4+L1Byb2NTZXRbL1BERi9UZXh0L0ltYWdlQi9JbWFnZUMvSW1hZ2VJXT4+CmVuZG9iagoKNyAwIG9iago8PC9Db250ZW50cyAyIDAgUi9NZWRpYUJveFswIDAgNTk1LjI3NiA4NDEuODldL1BhcmVudCA0IDAgUi9SZXNvdXJjZXMgNiAwIFIvVHlwZS9QYWdlPj4KZW5kb2JqCgo0IDAgb2JqCjw8L0NvdW50IDEvS2lkc1s3IDAgUl0vVHlwZS9QYWdlcz4+CmVuZG9iagoKOCAwIG9iago8PC9CYXNlRm9udC9IZWx2ZXRpY2EvRW5jb2RpbmcvV2luQW5zaUVuY29kaW5nL1N1YnR5cGUvVHlwZTEvVHlwZS9Gb250Pj4KZW5kb2JqCgp4cmVmCjAgOQowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAyMzEgMDAwMDAgbiAKMDAwMDAwMDAxNSAwMDAwMCBuIAowMDAwMDAwMjEyIDAwMDAwIG4gCjAwMDAwMDA1MjYgMDAwMDAgbiAKMDAwMDAwMDI3OSAwMDAwMCBuIAowMDAwMDAwMzgwIDAwMDAwIG4gCjAwMDAwMDA0MjUgMDAwMDAgbiAKMDAwMDAwMDU3NyAwMDAwMCBuIAp0cmFpbGVyCjw8L0luZm8gNSAwIFIvUm9vdCAxIDAgUi9TaXplIDk+PgpzdGFydHhyZWYKNjY1CiUlRU9GCg==';
    const base64Data = fakeBase64.replace(/^data:.*?;base64,/, '');
    const fileBuffer = Buffer.from(base64Data, 'base64');
    const backendFilePath = 'test_upload.pdf';
    fs.writeFileSync(backendFilePath, fileBuffer);

    console.log("Testing upload from file...");
    const uploadRes = await cloudinary.uploader.upload(backendFilePath, {
      resource_type: 'raw',
      type: 'upload',
      access_mode: 'public',
      chunk_size: 6000000,
      folder: 'blog_attachments',
      filename_override: 'unique_blog_file.pdf',
      use_filename: true,
      unique_filename: true,
    });
    console.log("SUCCESS:", uploadRes.secure_url);
  } catch (err) {
    console.error("ERROR:", err.message, err);
  }
}
run();
