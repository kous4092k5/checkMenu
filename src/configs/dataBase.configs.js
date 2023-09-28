    import * as dotenv from 'dotenv';

    import mongoose from 'mongoose';

    dotenv.config();

    export const connectDb = () => {
    mongoose
        .connect(
            "mongodb://127.0.0.1:27017/backend-denso"
        )
        .then(() => console.log('Database connected!'))
        .catch((err) => console.log(err));
    };
