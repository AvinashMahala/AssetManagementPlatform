import bcrypt from 'bcrypt';

const testPassword = 'user123';
const hashFromDb = '$2b$12$JQbCI.eNDBJyRCe41DmnpuJqo1hYl7Z.8YHolVqT2T9maGrGa38WW';

console.log('Testing bcrypt password verification...');
console.log('Plain password:', testPassword);
console.log('Hash from DB:', hashFromDb);

bcrypt.compare(testPassword, hashFromDb).then(result => {
  console.log('Verification result:', result);
  
  // Also try with a freshly hashed password
  bcrypt.hash(testPassword, 12).then(newHash => {
    console.log('\nNew hash:', newHash);
    bcrypt.compare(testPassword, newHash).then(newResult => {
      console.log('New hash verification:', newResult);
    });
  });
}).catch(err => {
  console.error('Error:', err);
});
