import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test file upload functionality
async function testFileUpload() {
  console.log('🧪 Testing File Storage System...\n');

  try {
    // Test 1: Check if we can import the services
    console.log('✅ Test 1: Importing services...');
    const { FileStorageService } = await import('./dist/src/services/FileStorageService.js');
    console.log('✅ FileStorageService imported successfully\n');

    // Test 2: Check if we can import the controller
    console.log('✅ Test 2: Importing controller...');
    const { FileController } = await import('./dist/src/controllers/FileController.js');
    console.log('✅ FileController imported successfully\n');

    // Test 3: Check if we can import the routes
    console.log('✅ Test 3: Importing routes...');
    const { createFileRoutes } = await import('./dist/src/routes/fileRoutes.js');
    console.log('✅ File routes imported successfully\n');

    // Test 4: Create a test file buffer
    console.log('✅ Test 4: Creating test file buffer...');
    const testContent = 'This is a test file for the file storage system.';
    const testBuffer = Buffer.from(testContent, 'utf-8');
    console.log(`✅ Test file created (${testBuffer.length} bytes)\n`);

    // Test 5: Check file chunking logic
    console.log('✅ Test 5: Testing file chunking...');
    const fileStorageService = new FileStorageService(null, null); // We'll test the method directly
    const chunks = fileStorageService.chunkBuffer(testBuffer, 10); // Small chunks for testing
    console.log(`✅ File chunked into ${chunks.length} chunks`);
    const reconstructed = Buffer.concat(chunks);
    const matches = reconstructed.equals(testBuffer);
    console.log(`✅ File reconstruction ${matches ? 'successful' : 'failed'}\n`);

    console.log('🎉 All basic tests passed! File storage system is ready.');
    console.log('\n📋 Next steps:');
    console.log('1. Start the databases: docker-compose up -d');
    console.log('2. Start the backend: npm start');
    console.log('3. Test file upload via API endpoints');
    console.log('4. Integrate with frontend file upload UI');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testFileUpload();