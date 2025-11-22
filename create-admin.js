const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('./config');

mongoose.set('strictQuery', false);
mongoose.connect(config.db);

const UserSchema = new mongoose.Schema({
    mail: String,
    pass: String,
    name: String,
    profile_picture: String,
    permission: {type: Number, default: 1},
    updated_at: {type: Date, default: Date.now}
});

const User = mongoose.model("User", UserSchema);

async function createAdmin() {
    try {
        // Check if admin already exists
        const existingAdmin = await User.findOne({ mail: 'admin@drojd.com' });
        if (existingAdmin) {
            console.log('Admin user already exists');
            process.exit(0);
        }

        // Create admin user
        const salt = bcrypt.genSaltSync(10);
        const password = bcrypt.hashSync('admin123', salt);

        const admin = new User({
            mail: 'admin@drojd.com',
            pass: password,
            name: 'Admin',
            permission: 2 // Super admin
        });

        await admin.save();
        console.log('Admin user created successfully!');
        console.log('Email: admin@drojd.com');
        console.log('Password: admin123');
        
    } catch (error) {
        console.error('Error creating admin:', error);
    } finally {
        mongoose.connection.close();
    }
}

createAdmin();