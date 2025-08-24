import { createUser } from './createUser.js';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (question) => {
    return new Promise((resolve) => {
        rl.question(question, resolve);
    });
};

const interactiveUserCreation = async () => {
    try {
        console.log('🚀 Interactive User Creation');
        console.log('============================');
        console.log('');

        const username = await askQuestion('👤 Enter username: ');
        const email = await askQuestion('📧 Enter email: ');
        const password = await askQuestion('🔐 Enter password (min 6 chars): ');

        console.log('');
        console.log('Available roles:');
        console.log('1. admin   - Full access to everything');
        console.log('2. viewer  - Can view inventory and their own orders');
        console.log('');

        const roleChoice = await askQuestion('🎭 Select role (1-2) [default: 2]: ');

        const roleMap = {
            '1': 'admin',
            '2': 'viewer',
            '': 'viewer'
        };

        const role = roleMap[roleChoice] || 'viewer';

        console.log('');
        console.log('Creating user...');

        const user = await createUser({
            username,
            email,
            password,
            role
        });

        console.log('');
        console.log('✅ User created successfully!');
        console.log('📋 User Details:');
        console.log(`   ID: ${user.id}`);
        console.log(`   Username: ${user.username}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Created: ${user.createdAt}`);
        console.log('');
        console.log('🔐 Login credentials:');
        console.log(`   Username: ${user.username}`);
        console.log(`   Password: ${password}`);

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        rl.close();
    }
};

interactiveUserCreation();
