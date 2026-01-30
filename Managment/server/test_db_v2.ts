import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Try with brackets
const uri = "mongodb+srv://thanu:<thanu1234>@cluster0.r5kk3ja.mongodb.net/";
console.log('Testing URI with brackets...');

mongoose.connect(uri)
    .then(() => {
        console.log('SUCCESS: Connected to MongoDB with brackets');
        process.exit(0);
    })
    .catch((err) => {
        console.log('FAILURE with brackets');
        // Try without brackets
        const uri2 = "mongodb+srv://thanu:thanu1234@cluster0.r5kk3ja.mongodb.net/";
        console.log('Testing URI without brackets...');
        mongoose.connect(uri2)
            .then(() => {
                console.log('SUCCESS: Connected to MongoDB without brackets');
                process.exit(0);
            })
            .catch((err2) => {
                console.error('ALl attempts failed');
                console.error(err2.message);
                process.exit(1);
            });
    });
