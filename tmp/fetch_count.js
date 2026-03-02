const http = require('http');
http.get('http://localhost:3000/', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const match = data.match(/\\"Other Shiurim([^}]+)\"episodeCount\":(\d+)/i);
        if (match) {
            console.log('Other Shiurim count:', match[2]);
        } else {
            console.log('Not found in raw HTML payload.');
        }
    });
});
