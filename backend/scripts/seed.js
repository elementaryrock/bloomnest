/**
 * Seed script to create test data
 * Run with: node scripts/seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Models
const Patient = require('../models/Patient');
const Staff = require('../models/Staff');

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const hashedPassword = await bcrypt.hash('password123', 10);

        // Clear and create staff
        await Staff.deleteMany({});
        const staff = await Staff.insertMany([
            { staffId: 'STAFF001', name: 'Admin User', email: 'admin@therapy.com', phone: '9999999999', password: hashedPassword, role: 'admin', isActive: true },
            { staffId: 'STAFF002', name: 'Dr. Sarah', email: 'therapist@therapy.com', phone: '8888888888', password: hashedPassword, role: 'therapist', isActive: true },
            { staffId: 'STAFF003', name: 'Reception', email: 'reception@therapy.com', phone: '7777777777', password: hashedPassword, role: 'receptionist', isActive: true }
        ]);
        console.log('Created staff:', staff.map(s => s.email).join(', '));

        // Clear and create patient
        await Patient.deleteMany({});
        const patient = await Patient.create({
            specialId: 'JYCS2025000001',
            childName: 'Test Child',
            dateOfBirth: new Date('2018-05-15'),
            age: 6,
            gender: 'Male',
            parentName: 'Test Parent',
            parentPhone: '9876543210',
            parentEmail: 'parent@example.com',
            relationship: 'Father',
            address: '123 Test Street',
            diagnosis: ['ASD'],
            severity: 'Moderate',
            isActive: true
        });
        console.log('Created patient:', patient.specialId);

        console.log('\n========== TEST CREDENTIALS ==========');
        console.log('STAFF LOGIN (/staff/login):');
        console.log('  admin@therapy.com / password123');
        console.log('  therapist@therapy.com / password123');
        console.log('  reception@therapy.com / password123');
        console.log('\nPARENT LOGIN (/login):');
        console.log('  Special ID: JYCS2025000001');
        console.log('  Phone: 9876543210');
        console.log('  (OTP logged in backend console)');
        console.log('=======================================\n');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

seedData();
