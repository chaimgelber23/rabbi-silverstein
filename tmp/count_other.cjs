const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const Parser = require('rss-parser');

const serviceAccount = require('../../credentials.json');

if (!getApps().length) {
    initializeApp({
        credential: cert(serviceAccount)
    });
}
const db = getFirestore();

async function countShiurim() {
    const parser = new Parser();
    const feed = await parser.parseURL('https://jewishpodcasts.fm/rss/rabbiodomsilverstein');
    const rssShiurim = feed.items;

    const customSnapshot = await db.collection('customShiurim').get();
    const customShiurim = customSnapshot.docs;

    console.log(`RSS count: ${rssShiurim.length}`);
    console.log(`Custom count: ${customShiurim.length}`);
    console.log(`Total count: ${rssShiurim.length + customShiurim.length}`);

    // Now we need to know how many fall into "other".
    // Basically, how many don't match anything else?
    // We can just look at the live page JSON to see the count! Let's fetch the landing URL data if nextjs is running, or build a simple count here.
}

countShiurim().catch(console.error);
