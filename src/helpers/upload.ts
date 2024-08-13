import path from "path";
import fs from "fs";
import { uploadToCloudinary } from "@/helpers/cloudinary";

const UPLOAD_DIR = path.resolve(process.env.ROOT_PATH ?? "", "public/uploads");

export const uploadFile = async (formData: any) => {

  const body = Object.fromEntries(formData);
  const file = (body.file as Blob) || null;

  if (file) {
    const buffer = Buffer.from(await file.arrayBuffer());
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR);
    }

    fs.writeFileSync(
      path.resolve(UPLOAD_DIR, (body.file as File).name),
      buffer
    );
  } else {
    return ({
      success: false,
    })
  }

  const imgPath = path.join(UPLOAD_DIR, (body.file as File).name)
  const data = await uploadToCloudinary(imgPath)

  return ({
    success: true,
    name: (body.file as File).name,
    data: data
  })
}