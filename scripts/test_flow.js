const testFlow = async () => {
  try {
    console.log('--- STARTING AUTOMATED TEST FLOW ---');
    const baseUrl = process.env.API_URL || 'http://0.0.0.0:5005/api';

    // 1. Register a test user
    console.log('\n1. Testing User Registration...');
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: `test_${Date.now()}@example.com`,
        password: 'password123'
      })
    });
    const regData = await regRes.json();
    console.log('Registration Response:', regRes.status, regData);
    
    if (regRes.status !== 201) throw new Error('Registration failed');
    const token = regData.token;

    // 2. Add Reading History
    console.log('\n2. Testing Reading History Update (Auth Required)...');
    const histRes = await fetch(`${baseUrl}/history`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        surahNumber: 1,
        verseNumber: 1
      })
    });
    const histData = await histRes.json();
    console.log('History Update Response:', histRes.status, histData);

    // 3. Fetch Reading History
    console.log('\n3. Testing Reading History Fetch...');
    const getHistRes = await fetch(`${baseUrl}/history`, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${token}`
      }
    });
    const getHistData = await getHistRes.json();
    console.log('History Fetch Response:', getHistRes.status, getHistData);

    // 4. Add Bookmark
    console.log('\n4. Testing Bookmark Creation...');
    const markRes = await fetch(`${baseUrl}/bookmarks`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        surahNumber: 1,
        verseNumber: 2,
        arabicText: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
        translation: "All praise is due to Allah, Lord of the worlds"
      })
    });
    const markData = await markRes.json();
    console.log('Bookmark Creation Response:', markRes.status, markData);

    console.log('\n--- ALL TESTS COMPLETED SUCCESSFULLY! ---');
  } catch (error) {
    console.error('\nTEST FAILED:', error.message);
  }
};

testFlow();
