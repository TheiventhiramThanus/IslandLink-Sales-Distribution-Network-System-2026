import mongoose from 'mongoose';

const uri = 'mongodb://localhost:27017/isdn_system';
console.log('Testing Local URI:', uri);

mongoose.connect(uri)
    .then(() => {
        console.log('SUCCESS: Connected to Local MongoDB');
        process.exit(0);
    })
    .catch((err) => {
        console.error('FAILURE: Could not connect to Local MongoDB');
        console.error(err.message);
        process.exit(1);
    });
