const axios = require('axios');
async function test() { 
    const verses = ['1:1', '2:255', '112:1', '114:1', '18:110']; 
    const tafsirId = 160; 
    for (const v of verses) { 
        try { 
            const arabicRes = await axios.get('https://api.alquran.cloud/v1/ayah/'+v+'/editions/quran-uthmani,ur.jalandhry'); 
            const arabicText = arabicRes.data.data[0].text; 
            const urduTrans = arabicRes.data.data[1].text; 
            const tafsirRes = await axios.get('https://api.quran.com/api/v4/tafsirs/'+tafsirId+'/by_ayah/'+v); 
            const tafsirData = tafsirRes.data.tafsir; 
            let cleanText = tafsirData.text.replace(/<\/p>|<br\s*\/?>/gi, '\n\n').replace(/<[^>]+>/g, '').replace(/&quot;/g, '\"').replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\n\s*\n/g, '\n\n').trim(); 
            console.log('\n================= '+v+' ================='); 
            console.log('[Arabic]: '+arabicText); 
            console.log('[Urdu Trans]: '+urduTrans); 
            console.log('[Urdu Tafsir ('+tafsirData.resource_name+')]:\n'+cleanText.substring(0, 300)+'...'); 
        } catch (e) { 
            console.error('Error for '+v+':', e.message); 
        } 
    } 
} 
test();
