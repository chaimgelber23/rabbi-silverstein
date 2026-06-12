const admin = require('firebase-admin');

// Uses Application Default Credentials — run once: gcloud auth application-default login
admin.initializeApp({ projectId: 'rabbi-silverstein-site' });

const db = admin.firestore();

async function main() {
    // Get all custom shiurim, ordered by creation date
    const shiurimSnap = await db.collection('customShiurim').orderBy('createdAt', 'desc').get();
    console.log(`\n=== All Custom Shiurim (${shiurimSnap.size} total) ===\n`);
    for (const doc of shiurimSnap.docs) {
        const data = doc.data();
        console.log(`ID: ${doc.id}`);
        console.log(`  Title: ${data.title}`);
        console.log(`  Series: ${data.seriesSlug}`);
        console.log(`  PubDate: ${data.pubDate}`);
        console.log(`  AudioURL: ${data.audioUrl ? data.audioUrl.substring(0, 80) + '...' : 'NONE'}`);
        console.log(`  Duration: ${data.duration}`);
        console.log(`  CreatedAt: ${data.createdAt ? data.createdAt.toDate() : 'N/A'}`);
        console.log('');
    }

    // Get all custom series
    const seriesSnap = await db.collection('customSeries').get();
    console.log(`\n=== All Custom Series (${seriesSnap.size} total) ===\n`);
    for (const doc of seriesSnap.docs) {
        const data = doc.data();
        console.log(`Slug: ${doc.id} | Name: ${data.name} | Group: ${data.group}`);
    }

    // Get all custom groups
    const groupsSnap = await db.collection('customGroups').get();
    console.log(`\n=== All Custom Groups (${groupsSnap.size} total) ===\n`);
    for (const doc of groupsSnap.docs) {
        const data = doc.data();
        console.log(`Slug: ${doc.id} | Label: ${data.label}`);
    }

    process.exit(0);
}

main().catch(console.error);
