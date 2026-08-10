/**
 * StudySnap API Load & Stress Testing Script
 * Simulates concurrent VUs (Virtual Users) sending requests to NestJS Backend API
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';
const CONCURRENT_USERS = 20;
const TOTAL_REQUESTS_PER_USER = 10;

async function makeRequest(path) {
  return new Promise((resolve) => {
    const start = Date.now();
    http.get(`${BASE_URL}${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const duration = Date.now() - start;
        resolve({ statusCode: res.statusCode, duration });
      });
    }).on('error', (err) => {
      resolve({ statusCode: 500, duration: Date.now() - start, error: err.message });
    });
  });
}

async function simulateUser(userId) {
  const results = [];
  const endpoints = ['/api/categories', '/api/topics', '/api/photos', '/api/users'];
  
  for (let i = 0; i < TOTAL_REQUESTS_PER_USER; i++) {
    const targetPath = endpoints[i % endpoints.length];
    const result = await makeRequest(targetPath);
    results.push(result);
  }
  return results;
}

async function runLoadTest() {
  console.log(`🚀 Starting Load Test: ${CONCURRENT_USERS} Concurrent Users, ${TOTAL_REQUESTS_PER_USER} requests/user...`);
  const startTime = Date.now();

  const userPromises = [];
  for (let u = 0; u < CONCURRENT_USERS; u++) {
    userPromises.push(simulateUser(u));
  }

  const allResults = (await Promise.all(userPromises)).flat();
  const totalDuration = (Date.now() - startTime) / 1000;

  const successCount = allResults.filter(r => r.statusCode >= 200 && r.statusCode < 300).length;
  const avgLatency = allResults.reduce((acc, r) => acc + r.duration, 0) / allResults.length;

  console.log('\n📊 --- LOAD TEST RESULTS SUMMARY ---');
  console.log(`Total Requests Sent: ${allResults.length}`);
  console.log(`Successful Requests: ${successCount} / ${allResults.length}`);
  console.log(`Success Rate: ${((successCount / allResults.length) * 100).toFixed(2)}%`);
  console.log(`Total Time Taken: ${totalDuration.toFixed(2)}s`);
  console.log(`Requests Per Second (RPS): ${(allResults.length / totalDuration).toFixed(2)} req/s`);
  console.log(`Average Response Latency: ${avgLatency.toFixed(2)}ms`);
}

runLoadTest().catch(console.error);
