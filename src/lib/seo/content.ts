// Keyword-targeted, indexable SEO content for the hub pages.
// Audio shiurim are invisible to search engines, so each hub page carries a
// server-rendered intro + FAQ block (real text) plus FAQPage JSON-LD. This is
// the primary lever for ranking on queries like "5 minute Tanya" / "daily
// Nefesh HaChaim shiur" and for being cited by AI answer engines (GEO).

export interface SeoFaq {
  q: string;
  a: string;
}

export interface SeoPageContent {
  /** <title> — keyword-first, <= 60 chars. */
  titleTag: string;
  /** meta description — 140-155 chars. */
  metaDescription: string;
  /** Heading for the server-rendered intro block. Pass "" to hide it. */
  introHeading?: string;
  /** 2-3 indexable, self-contained paragraphs. */
  introParagraphs: string[];
  /** GEO-optimized Q&A, rendered as a native <details> accordion + FAQPage schema. */
  faqs: SeoFaq[];
}

// Keyed by hub-page slug (series slugs, group slugs, plus "home" and "about").
export const SEO_CONTENT: Record<string, SeoPageContent> = {
  home: {
    titleTag: "5 Minute Torah Shiurim | Rabbi Odom Silverstein",
    metaDescription:
      "5 minute Torah shiurim from Rabbi Odom Silverstein: short daily Tanya, Nefesh HaChaim, and Bitachon audio. Free, and easy to finish on the way to work.",
    introHeading: "About these shiurim",
    introParagraphs: [
      "The 5 minute Torah shiurim from Rabbi Odom Silverstein are short, daily audio lessons on three sefarim: Tanya, Nefesh HaChaim, and Bitachon. Each Tanya and Nefesh HaChaim shiur runs about 5 minutes and covers one perek (chapter) or section at a time. The Bitachon shiur runs about 7 minutes of chizuk (encouragement) drawn from the weekly Parsha and the Moadim (festivals). All of it is free.",
      "The shiurim cover both Chassidic and Litvish learning. Tanya, also called Likkutei Amarim, was written by Rabbi Schneur Zalman of Liadi (1745-1812), the first Rebbe of Chabad-Lubavitch, and is the foundational sefer of Chabad Chassidus. Nefesh HaChaim was written by Rabbi Chaim of Volozhin (1749-1821), the foremost student of the Vilna Gaon, and is a cornerstone of Lithuanian yeshiva hashkafa (outlook). It is one teacher learning through both traditions, a few minutes a day.",
      "You can listen here or on Spotify, Apple Podcasts, Amazon Music, and JewishPodcasts.fm. Pick a sefer, start with today's shiur, and keep going from where you left off. If you have never opened these sefarim before, the short format gives you a way in without committing to an hour-long class.",
    ],
    faqs: [
      {
        q: "Can you learn Tanya in 5 minutes a day?",
        a: "Yes. Each 5-minute Tanya shiur covers one perek (chapter) or part of a perek, with the main idea and takeaway explained in plain terms. The first section of Tanya, Likkutei Amarim, has 53 chapters, so at one short shiur most days you cover the core of the sefer in a few months. It is built for a commute or a coffee break.",
      },
      {
        q: "What is the Tanya about?",
        a: "Tanya, written in 1796 by Rabbi Schneur Zalman of Liadi (the Alter Rebbe of Chabad-Lubavitch), teaches how an ordinary Jew serves Hashem. Its central idea is the two souls in every person, the Godly soul and the animal soul, and the Beinoni, the intermediate person who controls his thought, speech, and action even when he still feels the pull of the animal soul.",
      },
      {
        q: "What is Nefesh HaChaim about?",
        a: "Nefesh HaChaim, written by Rabbi Chaim of Volozhin (1749-1821), the foremost student of the Vilna Gaon, has four she'arim (gates). They cover man created b'tzelem Elokim (in the image of G-d) and how his deeds affect the higher worlds, tefilla (prayer), kedusha (holiness) and the soul, and the supreme value of Torah study. It is a cornerstone of Litvish yeshiva thought.",
      },
      {
        q: "What is bitachon?",
        a: "Bitachon is trust and reliance on Hashem. The classic source is Chovos HaLevavos (Duties of the Heart), in its Shaar HaBitachon (Gate of Trust). The Bitachon shiurim here give about 7 minutes of chizuk (encouragement) each week, drawn from the weekly Parsha and the Moadim (festivals), so the trust is tied to what you are already learning that week.",
      },
      {
        q: "Where can I listen to the shiurim?",
        a: "You can listen on this site or on Spotify, Apple Podcasts, Amazon Music, and JewishPodcasts.fm. Search for the Rabbi Odom Silverstein 5 minute Torah shiurim on any of those apps. They are free, and you can play one on the way to work or while you fold laundry.",
      },
      {
        q: "Do I need to know Hebrew to follow along?",
        a: "No. The shiurim explain the ideas in clear English, and Hebrew and Yiddish terms are translated as they come up. A beginner with no background can start with the first Tanya shiur, and someone already learning in yeshiva can use the short format as a daily review.",
      },
    ],
  },

  tanya: {
    titleTag: "5 Minute Tanya: Daily Tanya Online, Free Audio",
    metaDescription:
      "5 minute Tanya, three times a week. Short, clear daily Tanya audio on the Alter Rebbe's sefer, free on Spotify, Apple Podcasts, and Amazon Music.",
    introHeading: "About the 5 Minute Tanya",
    introParagraphs: [
      "The 5 Minute Tanya is a short daily Tanya audio series that walks through the sefer one perek (chapter) at a time, with each segment running about five minutes and covering the main themes and takeaways of that chapter. New episodes are published three times a week, free, on Spotify, Apple Podcasts, Amazon Music, and JewishPodcasts.fm. It is built for someone who wants to learn Tanya online but only has a few minutes on the way to work or before Maariv.",
      "The Tanya, formally titled Likkutei Amarim (\"Collected Sayings\"), was written by Rabbi Schneur Zalman of Liadi (1745-1812), the first Rebbe of Chabad-Lubavitch, known as the Alter Rebbe. It was first published in 1796 and is the foundational text of Chabad Chassidus. Its central idea is the two souls inside every Jew, the Godly soul and the animal soul, and the path of the Beinoni, the intermediate person who serves Hashem in thought, speech, and action even while the inner struggle continues.",
      "Each segment gives you the heart of one perek in plain language, so the whole sefer becomes something you can actually keep up with over time. The same approach runs through the other short series here: 5 Minute Nefesh HaChaim and a weekly seven-minute Bitachon chizuk drawn from the Parsha and the Moadim.",
    ],
    faqs: [
      {
        q: "Can you learn Tanya in 5 minutes a day?",
        a: "Yes. The 5 Minute Tanya covers one perek (chapter) at a time, giving you the main idea and the practical takeaway in about five minutes. In that time you come away understanding what each chapter is teaching, even if you haven't read every word of the Hebrew text. New episodes come out three times a week, so you move through the sefer steadily without needing a long sitting.",
      },
      {
        q: "What is the Tanya about?",
        a: "The Tanya, written in 1796 by Rabbi Schneur Zalman of Liadi (the Alter Rebbe), is the foundational sefer of Chabad Chassidus. Its formal name is Likkutei Amarim. It explains that every Jew has two souls, a Godly soul and an animal soul, and it describes the Beinoni, the intermediate person who serves Hashem in thought, speech, and action even while the two souls pull in opposite directions.",
      },
      {
        q: "How is the Tanya structured?",
        a: "The Tanya has five parts. The first, Likkutei Amarim, has 53 chapters and contains the core teaching on the two souls and the Beinoni. The others are Shaar HaYichud VeHaEmunah, Igeres HaTeshuvah, Igeres HaKodesh, and Kuntres Acharon. The daily shiur moves through the chapters in order, so you can follow the sefer's own structure from the beginning.",
      },
      {
        q: "Is the Tanya good for beginners?",
        a: "Yes. You don't need Hebrew or prior background to start. Each five-minute segment explains the chapter's idea in clear language and points to what it means for daily avodas Hashem. Hebrew terms get glossed as they come up, so a first-time learner and someone who has seen the sefer before can both follow along. Start from perek one and go in order.",
      },
      {
        q: "Where can I listen to the daily Tanya shiur?",
        a: "The 5 Minute Tanya is free on Spotify, Apple Podcasts, Amazon Music, and JewishPodcasts.fm. It is audio-only, so you can listen on a commute, on a walk, or while doing something with your hands. There is nothing to buy and no signup required.",
      },
      {
        q: "What other seforim are taught here besides Tanya?",
        a: "Alongside the Tanya, the same short-form approach covers 5 Minute Nefesh HaChaim, the sefer by Rabbi Chaim of Volozhin (1749-1821), foremost disciple of the Vilna Gaon, on tzelem Elokim, tefilla, kedusha, and the value of Torah study. There is also Bitachon Weekly, a seven-minute chizuk on trust in Hashem drawn from the weekly Parsha and the Moadim.",
      },
    ],
  },

  "nefesh-hachaim": {
    titleTag: "5 Minute Nefesh HaChaim Shiur | Rabbi Odom Silverstein",
    metaDescription:
      "Free daily 5 minute Nefesh HaChaim shiur in plain English. Learn Rav Chaim Volozhiner's classic sefer one perek at a time, on Spotify or Apple.",
    introHeading: "About 5 Minute Nefesh HaChaim",
    introParagraphs: [
      "The 5 Minute Nefesh HaChaim shiur is a short, daily audio class on Nefesh HaChaim, the classic sefer written by Rabbi Chaim of Volozhin (Rav Chaim Volozhiner, 1749-1821), the foremost talmid of the Vilna Gaon. R' Odom Silverstein walks through the sefer one piece at a time, giving over the main idea of each section in about five minutes. The shiurim are free and run in order through all four she'arim (gates), reaching as far as Shaar 4, Perek 13.",
      "Nefesh HaChaim is built around four she'arim. Shaar 1 explains how man was created b'tzelem Elokim (in the image of Hashem) and how a person's deeds carry weight in the upper worlds. Shaar 2 turns to tefilla (prayer) and the divine Names. Shaar 3 deals with kedusha (holiness), the soul, and devekus (closeness to Hashem). Shaar 4 sets out the supreme value of Torah study, Torah lishmah (learning for its own sake). The sefer is a cornerstone of Litvish yeshiva hashkafa.",
      "You can listen on the website and on Spotify, Apple Podcasts, Amazon Music, and JewishPodcasts.fm. Five minutes a day is enough to keep moving through a sefer that yeshiva talmidim usually meet only in full-length shiurim.",
    ],
    faqs: [
      {
        q: "What is Nefesh HaChaim about?",
        a: "Nefesh HaChaim is a sefer by Rabbi Chaim of Volozhin (1749-1821), the leading talmid of the Vilna Gaon. It is organized into four she'arim (gates) that cover how a person's deeds affect the upper worlds, the meaning of tefilla and the divine Names, kedusha and the soul, and the supreme value of Torah study. It is a foundational text of Litvish yeshiva hashkafa.",
      },
      {
        q: "Who wrote Nefesh HaChaim?",
        a: "Nefesh HaChaim was written by Rav Chaim Volozhiner (Rabbi Chaim of Volozhin, 1749-1821), the foremost disciple of the Vilna Gaon. The sefer records his approach to a Jew's place in creation, the meaning of tefilla, kedusha and the soul, and the central role of Torah lishmah. It is one of the cornerstone works of Lithuanian yeshiva thought.",
      },
      {
        q: "What are the four she'arim of Nefesh HaChaim?",
        a: "Nefesh HaChaim has four she'arim (gates). Shaar 1 covers man created b'tzelem Elokim and how human deeds affect the upper worlds. Shaar 2 covers tefilla (prayer) and the divine Names. Shaar 3 covers kedusha, the soul, and devekus (closeness to Hashem). Shaar 4 covers the supreme value of Torah study, Torah lishmah.",
      },
      {
        q: "Can you learn Nefesh HaChaim in 5 minutes a day?",
        a: "Yes. The 5 Minute Nefesh HaChaim shiur gives over one piece of the sefer in about five minutes, so you can work through it section by section at a steady daily pace. A full-length yeshiva shiur goes through every word; this daily class follows the structure and the main ideas of all four she'arim in order.",
      },
      {
        q: "Where can I listen to the 5 Minute Nefesh HaChaim shiur?",
        a: "You can listen on this site and on Spotify, Apple Podcasts, Amazon Music, and JewishPodcasts.fm. Search for the Rabbi Odom Silverstein Podcast on any of those platforms. The shiurim are free, run about five minutes each, and go in order through the sefer as far as Shaar 4, Perek 13.",
      },
      {
        q: "Is Nefesh HaChaim a Chassidic or a Litvish sefer?",
        a: "Nefesh HaChaim is a Litvish (Lithuanian yeshiva) work. Rav Chaim Volozhiner was the foremost talmid of the Vilna Gaon, and the sefer is a cornerstone of Litvish hashkafa and mussar, especially its teaching on Torah lishmah. R' Odom Silverstein also teaches a separate 5 Minute Tanya series for those learning Chassidus.",
      },
    ],
  },

  bitachon: {
    titleTag: "Daily Bitachon Shiur from the Parsha and Moadim",
    metaDescription:
      "A free daily bitachon shiur drawing trust-in-Hashem chizuk from the weekly Parsha and the Moadim. Short audio you can finish on the way to work.",
    introHeading: "About the daily Bitachon shiur",
    introParagraphs: [
      "A daily bitachon shiur from Rabbi Odom Silverstein gives you a few minutes of chizuk (strengthening) built on trust in Hashem, taken straight from the weekly Parsha (the Torah portion read that week) and the Moadim (the festivals). Bitachon means relying on Hashem, the trust that He runs every detail of your day. The shiurim are free and you can listen on Spotify, Apple Podcasts, Amazon Music, and JewishPodcasts.fm.",
      "The weekly piece is called Bitachon Weekly, and it runs about 7 minutes. Each one takes a point from that week's Parsha or from the Yom Tov on the calendar and turns it into something you can carry through the week. The classic place this trust is laid out is Chovos HaLevavos, the Shaar HaBitachon (the Gate of Trust) by Rabbeinu Bachya ibn Paquda, and the shiurim speak in that spirit while staying tied to the week you're actually living.",
      "A short shiur you can finish on a commute or over coffee is how trust in Hashem becomes a daily habit. There is nothing to sign up for and nothing to pay.",
    ],
    faqs: [
      {
        q: "What is a daily bitachon shiur?",
        a: "A daily bitachon shiur is a short audio lesson that strengthens your trust in Hashem (bitachon). Rabbi Odom Silverstein draws each one from the weekly Parsha and the Moadim, so the chizuk lines up with the time of year you're in. The episodes are free and run a few minutes, made to fit into a normal busy day.",
      },
      {
        q: "What is bitachon?",
        a: "Bitachon is trust and reliance on Hashem, the calm that comes from knowing He is running every part of your life. The classic source is Chovos HaLevavos by Rabbeinu Bachya ibn Paquda, in the section called Shaar HaBitachon, the Gate of Trust. A daily bitachon shiur takes that idea and connects it to the week's Parsha.",
      },
      {
        q: "What is the difference between emunah and bitachon?",
        a: "Emunah is belief: knowing that Hashem exists and runs the world. Bitachon is the next step, leaning on that belief in real life and trusting Hashem with what happens to you. Emunah is what you know. Bitachon is how you live it when things are uncertain.",
      },
      {
        q: "How long is the Bitachon Weekly shiur?",
        a: "Bitachon Weekly runs about 7 minutes. It's a weekly piece of chizuk drawn from that week's Parsha or from the Moadim, the festivals. The length is on purpose, short enough to listen on the way somewhere and still walk away with one clear point about trusting Hashem.",
      },
      {
        q: "Where can I listen to the bitachon shiurim?",
        a: "The bitachon shiurim are free and available on Spotify, Apple Podcasts, Amazon Music, and JewishPodcasts.fm. You can follow along week by week as the Parsha cycle and the Moadim come around, or go back and listen to earlier ones whenever you want.",
      },
      {
        q: "Do I need a background in learning to follow these?",
        a: "No. The shiurim are made to be clear for anyone, whether you've been learning for years or are starting out. Hebrew terms get explained as they come up, and each shiur stays on one idea. You can begin with this week's Parsha and keep going from there.",
      },
    ],
  },

  parsha: {
    titleTag: "Parsha Shiur: Weekly Dvar Torah | Rabbi Odom Silverstein",
    metaDescription:
      "A short parsha shiur on the weekly Torah portion, plus Bitachon Weekly chizuk drawn from the Parsha. Free audio, about 5-7 minutes. Listen anytime.",
    introHeading: "About the Parsha shiur",
    introParagraphs: [
      "This parsha shiur gives you a short weekly Torah portion dvar torah you can finish on a coffee break: about five to seven minutes of audio on Parshas HaShavua, the weekly Torah reading. R' Odom Silverstein records two related series here. One is a short take on the parsha itself. The other is Bitachon Weekly, a roughly seven-minute piece of chizuk (strengthening, encouragement) drawn from that week's parsha and from the Moadim, the festivals of the year.",
      "Bitachon means trust and reliance on Hashem, and each week the lesson pulls a point of bitachon out of what Klal Yisrael is reading in shul that Shabbos. The format is plain on purpose. You get the main idea of the week, said clearly, without a long buildup, so it fits a commute, a coffee break, or the few minutes before davening.",
      "Every shiur is free. You can listen right on this site or follow along on Spotify, Apple Podcasts, Amazon Music, and JewishPodcasts.fm. A new piece of chizuk lines up with each week's parsha through the year, so you can keep pace with the kriah, the weekly Torah reading, week by week.",
    ],
    faqs: [
      {
        q: "What is a parsha shiur?",
        a: "A parsha shiur is a short class on the weekly Torah portion, the Parshas HaShavua read in shul each Shabbos. On this site the parsha shiur runs about five to seven minutes and pulls one clear idea out of the week's reading, so you can hear the main point and a takeaway without sitting through a long lecture.",
      },
      {
        q: "How long is the weekly parsha dvar torah?",
        a: "Each weekly parsha dvar torah is short by design, roughly five to seven minutes of audio. The Bitachon Weekly piece runs about seven minutes of chizuk (encouragement) drawn from that week's parsha and from the Moadim, the festivals of the Jewish year. The aim is to give you the heart of the week's Torah in the time you have.",
      },
      {
        q: "Where can I listen to the parsha shiur?",
        a: "You can listen free on this site, or follow the shiurim on Spotify, Apple Podcasts, Amazon Music, and JewishPodcasts.fm. Search for the Rabbi Odom Silverstein Podcast on your usual app and the weekly parsha and Bitachon Weekly episodes will be there. Every episode is free, with no signup.",
      },
      {
        q: "What is Bitachon Weekly?",
        a: "Bitachon Weekly is a roughly seven-minute weekly shiur of chizuk on bitachon, trust and reliance on Hashem. Each week R' Odom Silverstein draws a point of bitachon out of the current parsha or out of the Moadim, the festivals of the Jewish year, so the encouragement ties directly to what Klal Yisrael is learning that week.",
      },
      {
        q: "Is the parsha shiur free?",
        a: "Yes. The parsha shiur and the Bitachon Weekly chizuk are free to listen to on this site and on Spotify, Apple Podcasts, Amazon Music, and JewishPodcasts.fm. There is no signup and no payment to hear the weekly audio, so you can start with this week's parsha right now.",
      },
      {
        q: "Do I need a Torah background to follow the weekly shiur?",
        a: "No. The weekly parsha shiur is meant to be accessible. Each piece states one main idea from the parsha in plain language, and Hebrew terms are explained as they come up. Whether you learn daily or you are just getting started, a few minutes a week is enough to follow along with the kriah.",
      },
    ],
  },

  holidays: {
    titleTag: "Yom Tov Shiurim: Chag Torah & Bitachon Chizuk",
    metaDescription:
      "Short Yom Tov shiurim on the Yamim Tovim - Purim, Chanuka, Pesach, and the Yomim Noraim. Free chag Torah and bitachon chizuk you can hear in a few minutes.",
    introHeading: "About the Yom Tov shiurim",
    introParagraphs: [
      "These Yom Tov shiurim bring short, focused chag Torah to each of the Yamim Tovim (the festivals of the Jewish year): Purim, Chanuka, Pesach, and the Yomim Noraim (the High Holy Days of Rosh Hashana and Yom Kippur). They come from Rabbi Odom Silverstein's Bitachon Weekly series, about seven minutes of chizuk (strengthening, encouragement) drawn each week from the Parsha and the Moadim (the seasons and festivals). When a Yom Tov approaches, the chizuk turns to that chag and what it asks of us.",
      "Bitachon means trust and reliance on Hashem, the theme that ties these moadim together. Each festival carries its own avoda (spiritual work), and the shiurim connect the day in front of you to that one idea: leaning on Hashem in the way the season teaches it. The classic source for this avoda is Chovos HaLevavos, Shaar HaBitachon (the Gate of Trust) by Rabbeinu Bachya ibn Paquda, and the shiurim carry that mussar into the rhythm of the year.",
      "The shiurim are free and built to fit a busy day. Listen on this site or on Spotify, Apple Podcasts, Amazon Music, and JewishPodcasts.fm. A few minutes before Yom Tov, on the way to work, or while you set up for the seuda, you walk in with the chag already on your mind.",
    ],
    faqs: [
      {
        q: "What Yamim Tovim do these shiurim cover?",
        a: "They cover the festivals across the year: Purim, Chanuka, Pesach, and the Yomim Noraim (Rosh Hashana and Yom Kippur). The chizuk comes from Rabbi Odom Silverstein's Bitachon Weekly series, which draws each week on the Parsha and the Moadim (the festivals and seasons), so as a Yom Tov nears, the lesson turns to that chag.",
      },
      {
        q: "How long is each Yom Tov shiur?",
        a: "Each one runs about seven minutes. Bitachon Weekly is built as short chizuk you can hear in the time it takes to drive somewhere or set up for the seuda, so you can prepare for the chag without setting aside a long stretch.",
      },
      {
        q: "What does bitachon have to do with the Yamim Tovim?",
        a: "Bitachon means trust and reliance on Hashem. Each Yom Tov carries its own avoda (spiritual work), and these shiurim tie the day to that one theme: how the chag in front of you teaches leaning on Hashem. The classic source is Chovos HaLevavos, Shaar HaBitachon (the Gate of Trust) by Rabbeinu Bachya ibn Paquda.",
      },
      {
        q: "Where can I listen to the Yom Tov shiurim?",
        a: "You can listen here on the site, or on Spotify, Apple Podcasts, Amazon Music, and JewishPodcasts.fm. The shiurim are free. Search for the Rabbi Odom Silverstein Podcast on any of those platforms and the Bitachon Weekly episodes, including the Yom Tov chizuk, are there.",
      },
      {
        q: "Are these shiurim good for someone new to learning?",
        a: "Yes. The shiurim are short and plain-spoken, and Hebrew terms get a quick gloss when they come up. You do not need a background in the seforim to follow along. A few minutes of chizuk on the chag is meant to reach anyone, whether you have learned the Moadim before or are coming to them fresh.",
      },
      {
        q: "Do the shiurim come out before each Yom Tov?",
        a: "Bitachon Weekly publishes regularly and follows the calendar. The chizuk tracks the Parsha during ordinary weeks and turns to the chag as a Yom Tov approaches, so in the run-up to Purim, Chanuka, Pesach, or the Yomim Noraim, the lesson is on the festival you are heading into.",
      },
    ],
  },

  about: {
    titleTag: "About Rabbi Odom Silverstein | Daily 5-Min Shiurim",
    metaDescription:
      "Who is Rabbi Odom Silverstein? Meet the teacher behind the daily 5-minute Tanya, Nefesh HaChaim, and Bitachon shiurim - short, clear Torah audio, free.",
    introHeading: "",
    introParagraphs: [
      "Rabbi Odom Silverstein teaches Torah in short daily audio shiurim (recorded Torah classes) on Tanya, Nefesh HaChaim, and Bitachon (trust in Hashem). The recordings began in 2021 and grew into a library of close to 400 episodes, each one a few minutes long and built for a person learning on the go: a commute, a coffee break, a few quiet minutes before Maariv.",
      "The teaching follows the seforim themselves, perek by perek (chapter by chapter). The 5-Minute Tanya series walks through the sefer of the Alter Rebbe, Rabbi Schneur Zalman of Liadi, pulling out the main idea of each chapter in plain language. The 5-Minute Nefesh HaChaim series works through Rav Chaim Volozhiner's gates, and has covered the sefer through the fourth shaar on the supreme value of Torah study. Bitachon Weekly gives about seven minutes of chizuk (strengthening) on emunah and bitachon, drawn from the week's Parsha and the Moadim (the festivals of the year).",
      "The aim is simple: make these foundational seforim reachable for any Jew, whether you have learned them before or are opening them for the first time. The shiurim stay close to the text, keep the language clear, and ask for nothing more than five minutes of your day.",
    ],
    faqs: [
      {
        q: "Who is Rabbi Odom Silverstein?",
        a: "Rabbi Odom Silverstein is the teacher behind the Rabbi Odom Silverstein Podcast, a library of short daily Torah shiurim recorded between 2021 and 2024. He teaches four series: 5-Minute Tanya, 5-Minute Nefesh HaChaim, Bitachon Weekly, and Parsha, in close to 400 episodes, each only a few minutes long and meant for everyday listening.",
      },
      {
        q: "What does Rabbi Odom Silverstein teach?",
        a: "He teaches three foundational seforim in short daily form. The 5-Minute Tanya series covers the sefer of the Alter Rebbe chapter by chapter. The 5-Minute Nefesh HaChaim series works through Rav Chaim Volozhiner's four gates. Bitachon Weekly gives about seven minutes of chizuk on trust in Hashem, drawn from the weekly Parsha and the Moadim (festivals).",
      },
      {
        q: "Where can I listen to Rabbi Odom Silverstein's shiurim?",
        a: "The shiurim are on this site and on the major podcast platforms: Spotify, Apple Podcasts, Amazon Music, and JewishPodcasts.fm. You can also find them through iVoox, Podbean, and Stitcher. Each episode runs about five to seven minutes, so you can listen on a commute, a walk, or any short break in the day.",
      },
      {
        q: "Are the shiurim free?",
        a: "Yes. Every shiur is free to listen to, on this site and on every platform that carries the show. There is no signup, no fee, and no paywall. You can start with any series, Tanya, Nefesh HaChaim, or Bitachon, and learn at your own pace, one short episode at a time.",
      },
      {
        q: "How long are the shiurim?",
        a: "The Tanya and Nefesh HaChaim shiurim run about five minutes each, covering the main idea of one section of the sefer. The Bitachon Weekly shiurim run about seven minutes. The short length is intentional, so you can keep a daily learning habit even on a busy day, without falling behind.",
      },
      {
        q: "Do I need a background in learning to follow along?",
        a: "No. The shiurim are made to be clear for someone opening these seforim for the first time, while still staying true to the text for those who have learned them before. Hebrew terms are explained as they come up, and each episode focuses on one idea at a time, so you can follow along without prior study.",
      },
    ],
  },
};

export function getSeoContent(slug: string): SeoPageContent | undefined {
  return SEO_CONTENT[slug];
}
