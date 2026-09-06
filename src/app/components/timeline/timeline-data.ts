export interface TimelineEvent {
  title: string;
  summary?: string;
  story: string;
  image?: string;
  tags?: string[];

  // time data
  dateMode: "calendar" | "yearsAgo";
  dateValue: string | number;
  dateEndValue?: string | number;
}

export const timelineData: TimelineEvent[] = [
  {
    title: "Dry Land Specialists",
    summary: "Humans thought of themselves as pedestrians and had no clue about the water separated lands.",
    story: `Looking at the total historical pattern of man around the Earth and observing that three quarters of the Earth is water, it seems obvious why men, unaware that they would some day contrive to fly and penetrate the ocean in submarines, thought of themselves exclusively as pedestrians as dry land specialists.

Confined to the quarter of the Earth’s surface which is dry land it is easy to see how they came to specialize further as farmers or hunters—or, commanded by their leader, became specialized as soldiers. Less than half of the dry 25 per cent of the Earth’s surface was immediately favorable to the support of human life.

Thus, throughout history 99.9 per cent of humanity has occupied only 10 per cent of the total Earth surface, dwelling only where life support was visibly obvious. The favorable land was not in one piece, but consisted of a myriad of relatively small parcels widely dispersed over the surface of the enormous Earth sphere.

The small isolated groups of humanity were utterly unaware of one another’s existence. They were everywhere ignorant of the vast variety of very different environments and resource patterns occurring other than where they dwelt.`,
    image: "/humans-early-ok.jpg",
    tags: ["fromHumanity"],
    dateMode: "calendar",
    dateValue: "-3500",
  },
  {
    title: "Boats",
    summary: "Few, through experimentation and invention, developed small, and then big boats.",
    story: `There were a few human beings who gradually, through the process of invention and experiment, built and operated, first, local river and bay, next, along-shore, then off-shore rafts, dugouts, grass boats, and outrigger sailing canoes.

Finally, they developed voluminous rib-bellied fishing vessels, and thereby ventured out to sea for progressively longer periods. The historical development of those massively keeled and ribbed, deep-bellied ships, which came into human use in the 3000–1000 B.C. era of the Phoenicians, Cretans, and Mycenaeans, altogether altered and vastly enlarged the interregional and international physical-transporting means of the world's lines of supply.

The change was the shift over from armed-horsemen-escorted, overland caravanning to the thousand-fold greater cargo- and armaments-carrying capacity of the fighting-crew-manned fleets of those massively built, wind-sailing and slave-rowed, seagoing ships.`,
    image: "/humans-boat-bad.jpg",
    tags: ["fromHumanity"],
    dateMode: "calendar",
    dateValue: "-3000",
  },
  {
    title: "Outlaws",
    summary: "Because water is continuous, those few became the first world men, and always thought in terms of whole earth. They became incalculably rich and powerful. And secrecy became the essence of their lives so as to avoid waylays.",
    story: `Simply because the arbitrary laws enacted or edicted by men on the land could not be extended effectively to control humans beyond their shores and out upon the seas, the world men who lived on the seas were inherently outlaws, and the only laws that could and did rule them were the physical laws of the universe.

These Great Pirates often came into mortal battle with one another to see who was going to control the vast sea routes and eventually the world. Those who stayed on the top of the waters and prospered did so because of their comprehensive capability — they were the antithesis of specialists. They had high proficiency in dealing with celestial navigation, storms, the sea, the men, the ship, economics, biology, geography, history, and science.

They realized that if the other powerful pirates did not know where you were going, nor when you had gone, nor when you were coming back, they would not know how to waylay you. Secrecy became the essence of the lives of the successful pirates; ergo, how little is known today of that which I am relating.`,
    image: "/human-big-boat-2-gemini-ok.jpg",
    tags: ["fromHumanity"],
    dateMode: "calendar",
    dateValue: "-2000",
  },
  {
    title: "Anticipatory Divide and Conquer",
    summary: "They set up kingdoms and their schools to mandate local thinking coated as expertism for the bright ones who otherwise might pose threat to their domination.",
    story: `At the time of Leonardo and Galileo, with the advent of zero, truly large scale venturing commenced. The Leonardos of the time designed and developed the comprehensive strategy for running the world for a century to come.

This Leonardo-type planning inaugurated today’s large-scale, world-around industrialization’s vast scale of thinking. Applying anticipatory divide and conquer to take care of the bright people who might discover “what it is all about”, they set up kingdoms which were instructed to fetch the bright ones and mandate specialization for all and thereby enslave them.`,
    image: "/humans-divide-and-conquer-ok.png",
    tags: ["fromHumanity"],
    dateMode: "calendar",
    dateValue: "1452-04-15",
  },
  {
    title: "Malthus’ “You or me, ergo; Not enough for both”",
    summary: "Malthus, first receiver of global data, couldn’t foresee technology growth, and misjudged population and food relations.",
    story: `In 1800 Thomas Malthus, later professor of political economics of the East India Company College, was the first human in history to receive a comprehensively complete inventory of the world's vital and economic statistics.

In his findings, he concluded that humanity was increasing its numbers geometrically while increasing life-support production only arithmetically, ergo, an increasing majority of humans would have to live out their short years in want and misery. “Pray all you want,” said Malthus, “it will do you no good. There is no more!”`,
    image: "/humans-malthus-ok.jpg",
    tags: ["fromHumanity"],
    dateMode: "calendar",
    dateValue: "1798-01-01",
  },
  {
    title: "Entropy's Deathclock",
    summary: "Lacking light-understanding, specialist scientists applied entropy to Earth. Life was thought to be running down.",
    story: `First came their Royal Society scientific servants, with their “Great” Second Law of thermodynamics, whose “entropy” showed that every energy machine kept losing energy and eventually “ran down.”

In their pre–speed-of-light-measurement misconception of an omni-simultaneous-instant universe, that universe as an energy machine was thought also to be “running down.” And thus energy wealth and life support were erroneously thought to be in continuous depletion — originating the misconception of “spending.”`,
    image: "/humans-entropy-blackboard-gemini-changed-finek.jpg",
    tags: ["fromHumanity"],
    dateMode: "calendar",
    dateValue: "1803-01-01",
  },
  {
    title: "Darwin’s “Survival only of the fittest”",
    summary: "Darwin came up with his theory of evolution. Economists loved it.",
    story: `Charles Darwin, explaining his theory of animate evolution, said that survival was only for the fittest — a biological observation that would later be adopted eagerly by economists and politicians alike.`,
    image: "/darwin-ok.jpg",
    tags: ["fromHumanity"],
    dateMode: "calendar",
    dateValue: "1839-01-01",
  },
  {
    title: "Marx’s “Workers are the fittest”",
    summary: "Marx sees injustice, but builds up on the misjudged shortage of life support.",
    story: `Karl Marx, encountering the entropic–Malthusian–Darwinian narrative, asserted that “the workers who produce things are the fittest because they are the only ones who know how to physically produce and therefore they ought to be the ones to survive.” That was the beginning of the great class warfare.

All ideologies ranged somewhere between the Great Pirates and the Marxists — yet all assumed there was not enough to go around. This assumption became the rationalized hypothesis behind all sovereign claims to great areas of Earth.`,
    image: "/humans-darwin-ok.png",
    tags: ["fromHumanity"],
    dateMode: "calendar",
    dateValue: "1848-02-21",
  },  
  {
    title: "Einstein E = mc²",
    summary: "Einstein and Planck discover that energy can’t be 'spent'.",
    story: `Einstein and Planck discovered that energy is finite and infinitely conserved. The word “spending” thus became scientifically meaningless and obsolete.`,
    image: "/humans-albert-planck-ok.png",
    tags: ["fromHumanity"],
    dateMode: "calendar",
    dateValue: "1905-01-01",
  },
  {
    title: "World War I",
    summary: "This was the fight between the world pirates, and when the Pirates unintentionally gave up their comprehensive statuses and went extinct.",
    story: `World War I emerged as the most powerful out-pirates challenged the in-pirates with the technological innovation of an entirely new geometry of thinking. The Great Pirates came out of that war unable to cope with what was going on in the advanced scientific frontiers of industry.

Delegating inspection to experts, they lost their mastery — becoming extinct without anyone realizing. Yet, all our international trade, money systems, and accounting still follow the rules and terminology established by those Great Pirates.`,
    image: "/humans-ww1-ok.jpg",
    tags: ["fromHumanity"],
    dateMode: "calendar",
    dateValue: "1918-11-11",
  },
  {
    title: "Economic Crash of 1929",
    summary: "Pirates accelerated their demise even further.",
    story: `Specializing as money makers, the successors of the Great Pirates compounded their demise through the global economic crash.`,
    image: "/humans-1929-economic-crash-ok.png",
    tags: ["fromHumanity"],
    dateMode: "calendar",
    dateValue: "1929-09-04",
  },
  {
    title: "World War II",
    summary: "The divided world had to fight, as it didn’t know it was divided.",
    story: `Because world societies mistook local politicians for true leaders, each country tried separately to restart industry and economy. Their divided efforts and differing ideologies made global coordination impossible, leading inevitably to World War II.

Each assumed the validity of the Malthusian “not enough to go around” struggle, preparing for Armageddon with weaponry that could destroy all humanity — lacking any comprehensive oppositional thinking powerful enough to prevent it.`,
    image: "/humans-atom-bomb-ww2-ok.jpg",
    tags: ["fromHumanity"],
    dateMode: "calendar",
    dateValue: "1945-09-02",
  },
  {
    title: "First Computer",
    summary: "Computer comes up as human brain, but much better. Evolution’s antidote to specialization.",
    story: `Suddenly, unrecognized by society, the evolutionary antibody to the extinction of humanity through specialization appeared in the form of the computer and its comprehensively commanded automation — which made man obsolete as a physical production and control specialist, and just in time.`,
    image: "/humans-ENIAC-ok.jpg",
    tags: ["fromHumanity"],
    dateMode: "calendar",
    dateValue: "1948-06-21",
  },
  {
    title: "Utopia or Oblivion?",
    summary: "It is either for all or none.",
    story: `This brings us to the realization of the enormous educational task that must be accomplished urgently — to convert humanity’s spin-dive toward oblivion into an intellectually mastered pullout into safe and level flight.

If humanity comprehends and reacts effectively, it will open an entirely new chapter of experience, turning Spaceship Earth into a universe-exploring advantage.`,
    image: "/humans-utopiaoroblivion-gemini-ok.jpg",
    tags: ["fromHumanity"],
    dateMode: "yearsAgo",
    dateValue: 0,
  },
];