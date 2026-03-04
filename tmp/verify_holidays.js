import { getSeriesNavSections, getSeriesShiurim } from './src/lib/seriesData.js';

async function run() {
    const sections = await getSeriesNavSections('holidays');
    console.log("Nav Sections:", sections);

    const shiurim = await getSeriesShiurim('holidays');
    const missingShiurim = shiurim.filter(s => s.title.includes('Simcha of Hashem') || s.title.includes('Pre Megilla Leining 5785'));
    console.log("Missing Shiurim now assigned to:", missingShiurim.map(s => ({ title: s.title, navSection: s.navSection })));
}
run();
