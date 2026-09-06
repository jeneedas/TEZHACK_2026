import { db } from './firebase.js';

async function testFirebase() {
  await db.collection('test').doc('connection').set({
    connected: true,
    timestamp: new Date(),
  });

  console.log('Firebase connection successful.');
}

testFirebase().catch((error) => {
  console.error('Firebase connection failed:', error);
});