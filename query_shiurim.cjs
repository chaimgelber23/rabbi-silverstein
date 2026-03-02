const admin = require('firebase-admin');

admin.initializeApp({
    credential: admin.credential.cert({
        projectId: 'rabbi-silverstein-site',
        clientEmail: 'firebase-adminsdk-fbsvc@rabbi-silverstein-site.iam.gserviceaccount.com',
        privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC+XJhmlyPWazC/\nejf0HrTpqqBRzYra7xl7jvHIuu3J2agEll4nU1afHp4ShDWeKmJD8mswKAmsTRAj\nVAjcfe0S+/6tSSr+oQ5tl8GyJddmF1mMRHNcYZQ9wcid/v6bWcT8qnqXjhsoJ8cH\niMFQogvjWEwZ1lkGVEuzfMaZRBRO2nf7GURtXyJ6JYo1wJjFob8LWaojVO2jucsm\niDpyFC/+3Kwv/KZlzzs4sICe/ZyvuH7keAd2iLJZyd3gwMkrsRQLP8A7wJf/hqN8\n9sCYLsR5+MK+T5JwQ/P0VrB1zWXLoFzfiXwatCogFyvTXpZNsO9L69LjexLzsfYi\negKtwANvAgMBAAECggEACCEuiwG9EJJUVcu+Pv6JYwnxPdJwMdMQkgkemfV4Y+yX\n3dZJdWwm4LXEh22TrUpfFvVv5Bxu8/z4iaG0R9etkRLSTgviulbI0HUGMHmoPh5q\nKcY0l7HnzE64fB2LObmMOEQpkcu1AjKCBU2EVVFjqOpjmZ42ABddLPBRD55A2xsr\nbng6M1YwBMgAZ51w2IwkWFTpTlwzJ3QsUSpGY+LRlJlGDICz/Hg6M6863nwltHNi\nO4Q7NXRxjc+eF07xdVDWCdQo2Y8hACVyRmMZD+BgvHR108K2BBfGHTjMGZQBC3xr\n37bSs+hr34O24/1mryHz3K98goCINMi47KpJA0ybLQKBgQD2NhtUsabi8jpwjurE\npTnyu3RJ/jfWxuZURRlwx0KGqEtvmib/KPHwzynBAcVZOkAaY9UsaBn6o6XTqWI5\nvhjgOrM3HnlOvevBnyibFYQQDsMgxHHgOo0TT4+W3s2PAJt6TNxqkDoFbWi1vE4P\nIE1jlaClROEyWEaCuoJOTze1AwKBgQDF7g+qWZYRb0BBAJAejRGpW+aBnLiU1CMj\nN/eSNV81kGsJK8VrQBOi/ZJInJARxKwdkF8qO/gN1aaOe9/yLFYtQnuslVxk7iWB\n21zPB/Bz+wXcfpiNcWKWV7W80tMGPBMyeNGWKWeE+Pczg5/Dojmb1+Qbne0vOWty\nbO7wHqmeJQKBgE3i9+pm+KA6eHo6+9GRYy+CVVtC7G8pJJvr8AxZPJZUjuiTH1sA\nnOjM4CyKXt/HKZgvlLQjinRbaI34u3YAyOXGLAN3xHBAbGAn9TR6LfjWcqve+Rcx\n7ob5WDcl7GkcjBK4VdHwJiqpXcJ/+0GVumWSY+tkSskeW8/nKGmVbc35AoGBAK3L\nzcGdDGKet2LcZbAN2rZFVe/1dzZn17qzCBY/+ywDdZkF8EGucA+sbGiJ4Q9ZDHCh\nNo7VPYiYU7nFF+2D9N+lAweV1x1g51pRDftUU1Tj1E+6caWxLAorVg9JZ7aPxaOJ\n5y7diGKAYj+/keesaL1pIokFcSEIYEqHUH9TzUhpAoGBAKdWOlvHreEYZ3R9lrnC\nqfjXg8HDRUWXXro2i20pimnBnwFKWvio8gApRjUiNmD859v8zlTGtndf9+O1P/zI\nsKNvldr/jPNe4a8ASNgY5hspdIW0knJMA4gcyV3a2ZgAJr5Ta9rVtZ03xtTcGfml\nG70hf4dzatfyWFXgsyuEsxXj\n-----END PRIVATE KEY-----\n",
    }),
});

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
