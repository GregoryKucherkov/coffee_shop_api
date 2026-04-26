import multer from "multer";
import path from "node:path";
import HttpError from "../utils/HttpError.js";
import { v4 as uuidv4 } from "uuid";

const tempDir = path.resolve("temp");

const mimetypeWhitelist = ["image/png", "image/jpeg", "image/jpg"];

const fileFilter = (req, file, cb) => {
    if (!mimetypeWhitelist.includes(file.mimetype)) {
        return cb(HttpError(400, "Only images (png, jpeg, jpg) are allowed"));
    }
    cb(null, true);
};

const storage = multer.diskStorage({
    destination: tempDir,
    filename: (req, file, cb) => {
        const userId = req?.user?.id;

        if (!userId) {
            return cb(new Error("Missing user ID"));
        }

        const ext = path.extname(file.originalname);

        const filename = `${userId}_${uuidv4()}${ext}`;
        cb(null, filename);
    },
});

const limits = {
    fileSize: 1024 * 1024 * 5,
};

const upload = multer({
    storage,
    limits,
    fileFilter,
});

export default upload;
