const mongoose = require('mongoose');
require('dotenv').config({path: './.env'});
const Patient = require('./models/Patient');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const parent = await Patient.findOne({ parentPhone: { $exists: true, $ne: '' } });
    if (parent) {
        console.log(`Login available -> ID: ${parent.specialId}, Phone: ${parent.parentPhone}`);
    } else {
        console.log('No valid patient with phone number found.');
    }
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
