#!/usr/bin/env node

/**
 * Test script to verify error logging captures actual error details
 */

const axios = require('axios');

async function testErrorLogging() {
  const baseURL = 'http://localhost:3000/api';

  console.log('🧪 Testing error logging with actual error details...\n');

  try {
    // Test 1: Try to update a tenant with invalid data to trigger validation error
    console.log('Test 1: Triggering validation error in tenant update...');
    const response = await axios.put(`${baseURL}/tenants/invalid-uuid`, {
      monthlyIncome: 'not-a-number', // This should cause a type conversion issue
      totalRentals: 'also-not-a-number'
    }, {
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Unexpected success:', response.data);
  } catch (error) {
    console.log('✅ Expected error occurred');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Response:', error.response.data);
    }
  }

  console.log('\n⏳ Waiting a moment for logs to be written...');
  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log('📋 Check the error logs at logs/backend/error-*.log to verify actual error details are captured');
}

testErrorLogging().catch(console.error);