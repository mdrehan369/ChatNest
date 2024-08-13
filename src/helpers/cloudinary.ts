import { v2 as cloudinary } from 'cloudinary';
import multer from "multer";
import fs from "fs";

const storage = multer.diskStorage({
    destination: (req: any, file: any, cb: any) => {
        cb(null, '');
    },
    filename: (req: any, file: any, cb: any) => {
        cb(null, Date.now() + '-' + file.originalname);
    },
});

const filter = (req: any, file: any, cb: any) => {
    if (
        file.mimetype == "image/png" ||
        file.mimetype == "image/jpeg" ||
        file.mimetype == "image/jpg"
    ) {
        cb(null, true)
    } else {
        cb(null, false)
    }
}

const upload = multer({ storage: storage, fileFilter: filter });

const uploadToCloudinary = async (localPath: any) => {
    cloudinary.config({
        cloud_name: `${process.env.CLOUDINARY_CLOUD_NAME}`,
        api_key: `${process.env.CLOUDINARY_API_KEY}`,
        api_secret: `${process.env.CLOUDINARY_API_SECRET}`,
        secure: false,
    })
    try {
        let response = await cloudinary.uploader.upload(localPath);
        fs.unlinkSync(localPath);
        return { url: response.url, publicId: response.public_id };
    } catch (e) {
        console.log("Error from cloudinary");
        console.log(e);
        fs.unlinkSync(localPath);
    }
}

const deleteImage = async (publicId: any) => {
    try {
        let response = await cloudinary.uploader.destroy(publicId);
        return response;
    } catch (e) {
        console.log(e);
    }
}

export {
    upload,
    uploadToCloudinary,
    deleteImage
}