import HttpError from "../utils/HttpError.js";

export const validateBody = (itemSchema) => {
    const func = (req, _, next) => {
        const { error } = itemSchema.validate(req.body, { abortEarly: false });

        if (error) {
            return next(
                HttpError(
                    400,
                    error.details.map((detail) => detail.message).join(", "),
                ),
            );
        }
        next();
    };
    return func;
};
