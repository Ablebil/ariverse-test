import "dotenv/config";
import crypto from "crypto";
import { promisify } from "util";
import { PrismaClient } from "../src/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const scryptAsync = promisify(crypto.scrypt) as (
  password: string,
  salt: string,
  keylen: number
) => Promise<Buffer>;

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = await scryptAsync(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

const GENRES = [
  "Action",
  "RPG",
  "Adventure",
  "Strategy",
  "Simulation",
  "Sports",
  "Horror",
  "Puzzle",
  "Fighting",
  "Racing",
];

const PLATFORMS = [
  "PC",
  "PlayStation 5",
  "PlayStation 4",
  "Xbox Series X",
  "Xbox One",
  "Nintendo Switch",
  "iOS",
  "Android",
];

const ADMIN = {
  name: "Admin GameVault",
  email: "admin@gamevault.com",
  password: "admin123456",
  role: "admin" as const,
};

const GAMES = [
  {
    title: "Elden Ring",
    developer: "FromSoftware",
    publisher: "Bandai Namco Entertainment",
    releaseDate: new Date("2022-02-25"),
    rating: 9.5,
    price: 449000,
    description:
      "An open-world action RPG set in the Lands Between, crafted in collaboration with George R.R. Martin.",
    longDescription:
      "Elden Ring thrusts players into the Lands Between, a vast open world filled with ancient ruins, towering fortresses, and grotesque creatures born from a shattered age. As a Tarnished, you must collect fragments of the Elden Ring and become the Elden Lord.\n\nThe game builds on FromSoftware's signature challenging combat, adding mounted exploration, stealth mechanics, and a seamless open world that encourages experimentation. Every corner of the map hides lore, weapons, and surprises.\n\nFrom devastating bosses to hidden underground kingdoms, Elden Ring rewards curiosity and perseverance in equal measure. Its world-building, co-written with George R.R. Martin, gives the game a mythological depth unlike anything the studio has made before.",
    tags: ["open-world", "souls-like", "dark-fantasy", "challenging", "multiplayer"],
    featured: true,
    genres: ["Action", "RPG"],
    platforms: ["PC", "PlayStation 5", "PlayStation 4", "Xbox Series X"],
  },
  {
    title: "God of War Ragnarok",
    developer: "Santa Monica Studio",
    publisher: "Sony Interactive Entertainment",
    releaseDate: new Date("2022-11-09"),
    rating: 9.4,
    price: 449000,
    description:
      "Kratos and Atreus journey across the Nine Realms as Fimbulwinter heralds the onset of Ragnarok.",
    longDescription:
      "God of War Ragnarok continues the saga of Kratos and his son Atreus as they navigate the political turmoil of the Norse realms. The threat of Ragnarok looms, and alliances both new and fragile must be forged to survive the coming apocalypse.\n\nSanta Monica Studio expands the combat system with new weapon abilities, shield stances, and enemy types spread across nine distinct realms, each with unique environments and mythology. The bond between father and son deepens in unexpected ways, driving a story filled with loss, growth, and sacrifice.\n\nRagnarok stands as one of the most polished action-adventure games ever made, blending blockbuster spectacle with genuine emotional depth and endlessly satisfying gameplay.",
    tags: ["action-adventure", "mythology", "story-driven", "combat", "single-player"],
    featured: true,
    genres: ["Action", "Adventure"],
    platforms: ["PlayStation 5", "PlayStation 4"],
  },
  {
    title: "Cyberpunk 2077",
    developer: "CD Projekt Red",
    publisher: "CD Projekt",
    releaseDate: new Date("2020-12-10"),
    rating: 8.5,
    price: 299000,
    description:
      "A first-person open-world RPG set in the sprawling dystopian megacity of Night City.",
    longDescription:
      "Cyberpunk 2077 places you in the role of V, a mercenary outlaw in Night City, a neon-drenched megalopolis obsessed with power, glamour, and modification. After a heist goes wrong, a digital ghost of a legend becomes entwined with your very soul.\n\nThe game offers a vast open world packed with side quests, gangs, corporations, and characters that feel genuinely alive. Playstyles range from stealthy netrunner to full-on street fighter, with builds that can be deeply customized using cyberware and skill trees.\n\nFollowing a troubled launch, the Phantom Liberty expansion and multiple patches transformed Cyberpunk 2077 into a definitive RPG experience, earning widespread critical re-evaluation and a devoted player base.",
    tags: ["open-world", "sci-fi", "rpg", "futuristic", "story-driven"],
    featured: false,
    genres: ["RPG", "Action"],
    platforms: ["PC", "PlayStation 5", "PlayStation 4", "Xbox Series X"],
  },
  {
    title: "Red Dead Redemption 2",
    developer: "Rockstar Games",
    publisher: "Rockstar Games",
    releaseDate: new Date("2019-11-05"),
    rating: 9.6,
    price: 299000,
    description:
      "A sweeping open-world western epic following outlaw Arthur Morgan in the dying age of the American frontier.",
    longDescription:
      "Red Dead Redemption 2 is set in 1899, following Arthur Morgan and the Van der Linde gang as they flee from government agents and bounty hunters across a stunning recreation of frontier America. The world is one of the most detailed ever put into a video game.\n\nEvery interaction carries weight, from the way Arthur writes in his journal to the honor system that shifts his reputation and the world's reaction to him. Hunting, fishing, camp management, and stranger missions give the game a life that extends far beyond the main story.\n\nRockstar's masterpiece is a meditation on loyalty, mortality, and the end of an era. Its story is among the finest ever told in the medium, and its open world remains unmatched in scope and authenticity.",
    tags: ["open-world", "western", "story-driven", "survival", "immersive"],
    featured: true,
    genres: ["Action", "Adventure"],
    platforms: ["PC", "PlayStation 4", "Xbox One"],
  },
  {
    title: "Hades",
    developer: "Supergiant Games",
    publisher: "Supergiant Games",
    releaseDate: new Date("2020-09-17"),
    rating: 9.2,
    price: 149000,
    description:
      "A rogue-like dungeon crawler in which you battle out of the Underworld with the help of the Olympian gods.",
    longDescription:
      "Hades puts you in the sandals of Zagreus, immortal son of the god of the dead, as he attempts to escape his father's realm by fighting through ever-shifting chambers filled with monsters. Each run is different, powered by boons gifted from the gods of Olympus.\n\nSupergiant Games weaves a rich narrative directly into the gameplay loop. Dying is not failure but progress, unlocking new dialogue, relationships, and story beats with a cast of characters drawn from Greek mythology. The writing is sharp, funny, and surprisingly moving.\n\nHades redefined what a roguelike could be, proving the genre could carry a compelling, fully voiced story without sacrificing the replayability that defines it.",
    tags: ["roguelike", "dungeon-crawler", "indie", "fast-paced", "replayable"],
    featured: true,
    genres: ["Action", "RPG"],
    platforms: ["PC", "PlayStation 5", "PlayStation 4", "Nintendo Switch"],
  },
  {
    title: "Resident Evil Village",
    developer: "Capcom",
    publisher: "Capcom",
    releaseDate: new Date("2021-05-07"),
    rating: 8.8,
    price: 299000,
    description:
      "Ethan Winters searches for his kidnapped daughter in a mysterious European village ruled by powerful lords.",
    longDescription:
      "Resident Evil Village continues the story of Ethan Winters, dropping him into a snow-blanketed village crawling with werewolves, vampires, and far darker horrors. The game blends survival horror with explosive action across a series of unforgettable set pieces.\n\nEach of the four lords controls a domain with its own visual identity and horror subgenre, keeping the pacing varied and the tension consistently high. Resource management, crafting, and the merchant system encourage exploration of every shadowy corner.\n\nThe game is a love letter to classic horror while pushing the series forward. Its climax and endgame revelations set up a new chapter for the franchise while delivering one of the most satisfying entries in the Resident Evil saga.",
    tags: ["survival-horror", "first-person", "atmospheric", "action", "gothic"],
    featured: false,
    genres: ["Horror", "Action"],
    platforms: ["PC", "PlayStation 5", "PlayStation 4", "Xbox Series X"],
  },
  {
    title: "Hollow Knight",
    developer: "Team Cherry",
    publisher: "Team Cherry",
    releaseDate: new Date("2018-06-12"),
    rating: 9.1,
    price: 49000,
    description:
      "A challenging action-adventure through a vast ruined kingdom of insects and heroes.",
    longDescription:
      "Hollow Knight is a hand-drawn action-adventure set in Hallownest, a fallen kingdom buried deep beneath a forgotten town. You play as the Knight, a silent bug warrior exploring tunnels, temples, and forests populated by strange and hostile creatures.\n\nThe game is built around tight platforming, precise melee combat, and a massive interconnected world with dozens of hours of content hidden throughout. Upgrades, charms, and new abilities are earned through exploration and defeating bosses.\n\nTeam Cherry delivered an indie masterpiece that punches far above its budget in terms of art, music, and design. Its optional content rivals the main quest in scope, and its lore rewards those who dig into its quiet, melancholy world.",
    tags: ["metroidvania", "indie", "challenging", "atmospheric", "platformer"],
    featured: false,
    genres: ["Action", "Adventure"],
    platforms: ["PC", "PlayStation 4", "Nintendo Switch"],
  },
  {
    title: "Stardew Valley",
    developer: "ConcernedApe",
    publisher: "ConcernedApe",
    releaseDate: new Date("2018-12-13"),
    rating: 9.0,
    price: 49000,
    description:
      "Build your farm, befriend villagers, and uncover the secrets of Stardew Valley in this beloved life simulation RPG.",
    longDescription:
      "Stardew Valley begins with your character inheriting a rundown farm from their grandfather and leaving behind a soul-crushing corporate job. What follows is an open-ended life simulator where you grow crops, raise animals, mine for ore, and build a community.\n\nThe game operates on a seasonal calendar, each season bringing new crops, festivals, and events. The townsfolk have their own schedules, stories, and secrets to uncover through gifts and conversation. Romance and marriage are fully realized gameplay systems.\n\nCreated entirely by one developer over four years, Stardew Valley is a remarkable achievement of scope and heart. Its multiplayer update added co-op farming for up to four players, extending its already enormous replay value.",
    tags: ["farming", "relaxing", "indie", "life-sim", "crafting"],
    featured: false,
    genres: ["Simulation", "RPG"],
    platforms: ["PC", "PlayStation 4", "Nintendo Switch", "iOS", "Android"],
  },
  {
    title: "Among Us",
    developer: "Innersloth",
    publisher: "Innersloth",
    releaseDate: new Date("2020-11-16"),
    rating: 7.5,
    price: 0,
    description:
      "A social deduction game set aboard a space station where crewmates must identify hidden impostors.",
    longDescription:
      "Among Us places up to fifteen players on a spaceship completing tasks while trying to identify which of their crewmates are secretly murderous impostors. Discussion, accusation, and voting separate the innocent from the guilty.\n\nThe game's simplicity is its strength. Matches are short, rounds are chaotic, and the blend of logic, deception, and social pressure creates moments of pure entertainment unique to the genre. Cross-platform play ensures sessions are always easy to fill.\n\nAmong Us became a global phenomenon in 2020, uniting players across ages and skill levels. Regular updates have added new maps, roles, and cosmetics, keeping the community active years after its initial release.",
    tags: ["multiplayer", "social-deduction", "casual", "online", "party"],
    featured: false,
    genres: ["Strategy", "Puzzle"],
    platforms: ["PC", "Nintendo Switch", "iOS", "Android"],
  },
  {
    title: "Sekiro Shadows Die Twice",
    developer: "FromSoftware",
    publisher: "Activision",
    releaseDate: new Date("2019-03-22"),
    rating: 9.3,
    price: 149000,
    description:
      "A shinobi in late 1500s Sengoku Japan fights to rescue his lord and restore his severed arm.",
    longDescription:
      "Sekiro: Shadows Die Twice places you in the role of Wolf, a disgraced shinobi on a mission of vengeance and redemption in a war-torn, supernatural version of feudal Japan. The game abandons traditional RPG stats in favor of pure skill-based progression.\n\nCombat revolves around posture and deflection rather than stamina and rolling. Landing the killing blow requires breaking an enemy's composure through perfectly timed parries and aggressive pressure, creating some of the most satisfying moment-to-moment gameplay in any action game.\n\nFromSoftware stripped away the usual RPG scaffolding to deliver a focused, uncompromising action game. Sekiro is relentlessly demanding but equally rewarding, offering a sense of mastery that few games can match.",
    tags: ["souls-like", "samurai", "challenging", "single-player", "combat"],
    featured: false,
    genres: ["Action", "Adventure"],
    platforms: ["PC", "PlayStation 4", "Xbox One"],
  },
  {
    title: "FIFA 23",
    developer: "EA Sports",
    publisher: "Electronic Arts",
    releaseDate: new Date("2022-09-30"),
    rating: 7.8,
    price: 199000,
    description:
      "The final EA Sports FIFA title brings HyperMotion2 technology and expanded women's club football.",
    longDescription:
      "FIFA 23 marks the last installment under the long-running EA Sports and FIFA licensing partnership. It introduces HyperMotion2, a machine-learning technology that captures real match data from thousands of professional players to animate the game more realistically.\n\nWomen's club football arrives for the first time, adding teams from the top English and French leagues alongside existing national teams. Ultimate Team, Career Mode, and Pro Clubs all receive updates, while cross-play between console generations improves matchmaking.\n\nAs a farewell entry, FIFA 23 packs in more content than any previous edition. While the transition to a new era brings some rough edges, it remains the definitive football simulation for millions of players worldwide.",
    tags: ["football", "sports", "multiplayer", "competitive", "online"],
    featured: false,
    genres: ["Sports"],
    platforms: ["PC", "PlayStation 5", "PlayStation 4", "Xbox Series X"],
  },
  {
    title: "Tekken 8",
    developer: "Bandai Namco Studios",
    publisher: "Bandai Namco Entertainment",
    releaseDate: new Date("2024-01-26"),
    rating: 9.0,
    price: 449000,
    description:
      "The next chapter of the King of Iron Fist Tournament arrives with stunning visuals and the Heat system.",
    longDescription:
      "Tekken 8 concludes the conflict between father Kazuya Mishima and son Jin Kazama, delivering the most visually spectacular and mechanically refined entry in the series. The Unreal Engine 5-powered presentation is jaw-dropping in motion.\n\nThe new Heat system adds a layer of aggressive momentum to fights, rewarding pressure and offense while still demanding respect for fundamentals. The roster of 32 characters at launch all feel distinct and well-developed, with a substantial single-player story mode for newcomers.\n\nTekken 8 succeeds as both a competitive fighter for veterans and an accessible entry point for newcomers. Its online infrastructure is robust, and the practice tools are among the best in the genre.",
    tags: ["fighting", "competitive", "online", "3d", "martial-arts"],
    featured: false,
    genres: ["Fighting"],
    platforms: ["PC", "PlayStation 5", "Xbox Series X"],
  },
  {
    title: "Forza Horizon 5",
    developer: "Playground Games",
    publisher: "Xbox Game Studios",
    releaseDate: new Date("2021-11-09"),
    rating: 9.3,
    price: 299000,
    description:
      "An open-world racing festival set across the diverse landscapes of Mexico.",
    longDescription:
      "Forza Horizon 5 drops hundreds of cars into a stunning open-world recreation of Mexico, featuring active volcanoes, tropical beaches, dense jungles, ancient ruins, and sprawling cities. The map is the largest and most varied in the Horizon series.\n\nThe Horizon Festival structure gives players enormous freedom, offering road racing, cross-country events, stunt challenges, and barn find restoration alongside a full multiplayer suite. The car roster spans over 500 vehicles at launch with regular free additions.\n\nPlayground Games delivered a benchmark for the open-world racing genre. Forza Horizon 5 is endlessly content-rich and technically stunning, running beautifully across a wide range of hardware including Xbox Game Pass day one.",
    tags: ["racing", "open-world", "cars", "online", "simulation"],
    featured: false,
    genres: ["Racing", "Simulation"],
    platforms: ["PC", "Xbox Series X", "Xbox One"],
  },
  {
    title: "Celeste",
    developer: "Extremely OK Games",
    publisher: "Extremely OK Games",
    releaseDate: new Date("2018-01-25"),
    rating: 9.0,
    price: 49000,
    description:
      "A precision platformer about a young woman climbing a mysterious mountain while confronting her inner demons.",
    longDescription:
      "Celeste follows Madeline as she attempts to climb the titular mountain, battling increasingly difficult platforming challenges and the manifestations of her own anxiety and self-doubt. The game treats its mental health themes with rare sincerity and care.\n\nGameplay centers on precise movement mechanics including dashing, climbing, and wall-jumping, with hundreds of single-screen rooms that demand mastery of each mechanic. Assist Mode options make the game accessible to players of all skill levels without compromising the experience.\n\nCeleste is a triumph of design and storytelling, with a narrative that resonates far beyond the gameplay. Its soundtrack by Lena Raine is considered one of the best in recent gaming history.",
    tags: ["platformer", "indie", "challenging", "story-driven", "pixel-art"],
    featured: false,
    genres: ["Adventure", "Puzzle"],
    platforms: ["PC", "PlayStation 4", "Nintendo Switch"],
  },
  {
    title: "Age of Empires IV",
    developer: "Relic Entertainment",
    publisher: "Xbox Game Studios",
    releaseDate: new Date("2021-10-28"),
    rating: 8.7,
    price: 299000,
    description:
      "A real-time strategy classic returns with eight civilizations across four historical campaigns.",
    longDescription:
      "Age of Empires IV marks the long-awaited return of the iconic RTS franchise, bringing eight unique civilizations with asymmetric design to life across four campaign storylines. Each civilization plays differently, from the Mongols' nomadic mobility to the English longbow dominance.\n\nThe campaign missions are presented with real historical documentary footage bridging each battle, adding educational context that sets Age of Empires IV apart from genre contemporaries. Multiplayer offers ranked and casual modes across a variety of maps and win conditions.\n\nRelic Entertainment balanced accessibility for new players with deep strategic complexity for veterans. Regular content updates and new civilization additions have continued to grow the game since launch.",
    tags: ["real-time-strategy", "historical", "multiplayer", "building", "warfare"],
    featured: false,
    genres: ["Strategy"],
    platforms: ["PC"],
  },
  {
    title: "Assassins Creed Valhalla",
    developer: "Ubisoft Montreal",
    publisher: "Ubisoft",
    releaseDate: new Date("2020-11-10"),
    rating: 8.2,
    price: 199000,
    description:
      "Lead Viking raids across England as Eivor, building a settlement and forging alliances in a dark age world.",
    longDescription:
      "Assassin's Creed Valhalla puts you in the boots of Eivor, a fierce Viking raider sailing from Norway to establish a new clan home in ninth-century England. The world is massive, covering Norway, England, and beyond, with dense forests, rolling hills, and fortified monasteries to plunder.\n\nCombat is visceral and customizable, with dual-wielding, mounted combat, and raiding mechanics that let you storm enemy fortresses with your crew. The skill tree is vast, and build variety allows for wildly different playstyles within the same game.\n\nValhalla is one of the most content-rich entries in the Assassin's Creed series. Its post-launch expansions to Ireland, France, and the mythological realms of Asgard and Vinland significantly extended an already enormous game.",
    tags: ["open-world", "viking", "historical", "stealth", "action-rpg"],
    featured: false,
    genres: ["RPG", "Action", "Adventure"],
    platforms: ["PC", "PlayStation 5", "PlayStation 4", "Xbox Series X"],
  },
  {
    title: "Doom Eternal",
    developer: "id Software",
    publisher: "Bethesda Softworks",
    releaseDate: new Date("2020-03-20"),
    rating: 8.8,
    price: 149000,
    description:
      "The Doom Slayer battles demonic forces threatening all of creation in a brutally fast FPS.",
    longDescription:
      "Doom Eternal escalates the ultraviolence of its predecessor into a full tactical puzzle. Every encounter demands resource management through constant movement, weapon switching, and glory kills to replenish health, armor, and ammo on the fly.\n\nThe game is relentlessly kinetic, throwing waves of demons at the player across a variety of beautifully grotesque environments spanning Earth, Hell, and dimensions in between. The soundtrack by Mick Gordon is a perfect accompaniment to the carnage.\n\nid Software pushed the design philosophy of Doom 2016 to its logical extreme, creating one of the most demanding and rewarding FPS campaigns ever made. Doom Eternal rewards mastery with a rhythm-like satisfaction unique to the genre.",
    tags: ["fps", "fast-paced", "brutal", "single-player", "intense"],
    featured: false,
    genres: ["Action"],
    platforms: ["PC", "PlayStation 4", "Xbox One", "Nintendo Switch"],
  },
  {
    title: "Divinity Original Sin 2",
    developer: "Larian Studios",
    publisher: "Larian Studios",
    releaseDate: new Date("2018-08-31"),
    rating: 9.4,
    price: 149000,
    description:
      "A deeply complex turn-based RPG where you become a powerful Sourcerer in a world that fears your kind.",
    longDescription:
      "Divinity: Original Sin 2 is set in Rivellon, a world where Source magic is forbidden and those who wield it are hunted. You play as a Sourceror attempting to ascend to divinity, choosing from six origin characters each with unique backstories and dialogue options.\n\nThe turn-based tactical combat uses a rich elemental interaction system that rewards creative thinking. Surfaces, status effects, and environmental hazards can be combined in hundreds of ways, making each battle a satisfying experiment. The game supports up to four-player co-op throughout the full campaign.\n\nLarian Studios built one of the deepest and most reactive RPGs ever made. Every choice carries consequence, dialogue is written with remarkable depth, and the sheer density of quests, secrets, and branching paths ensures no two playthroughs are identical.",
    tags: ["turn-based", "rpg", "co-op", "story-driven", "deep"],
    featured: false,
    genres: ["RPG", "Strategy"],
    platforms: ["PC", "PlayStation 4", "Xbox One"],
  },
  {
    title: "Ghost of Tsushima",
    developer: "Sucker Punch Productions",
    publisher: "Sony Interactive Entertainment",
    releaseDate: new Date("2020-07-17"),
    rating: 9.1,
    price: 299000,
    description:
      "A samurai's quest to liberate Tsushima Island from Mongol invasion, by any means necessary.",
    longDescription:
      "Ghost of Tsushima follows Jin Sakai, a samurai who must embrace forbidden tactics to save his island from a devastating Mongol invasion in feudal Japan. The world is a breathtaking recreation of thirteenth-century Tsushima, guided by wind rather than a map marker.\n\nCombat blends cinematic sword duels with stealth assassinations and ranged combat. Four stances can be learned and switched mid-fight to exploit different enemy types, creating a satisfying depth beneath the accessible surface. The Legends online co-op mode added free post-launch content.\n\nSucker Punch Productions created a game that feels like living inside a classic samurai film. Ghost of Tsushima's art direction, music, and world design set a new standard for open-world presentation.",
    tags: ["open-world", "samurai", "stealth", "story-driven", "beautiful"],
    featured: false,
    genres: ["Action", "Adventure"],
    platforms: ["PlayStation 4", "PlayStation 5"],
  },
  {
    title: "Cuphead",
    developer: "Studio MDHR",
    publisher: "Studio MDHR",
    releaseDate: new Date("2018-04-18"),
    rating: 8.8,
    price: 99000,
    description:
      "A run-and-gun game inspired by 1930s cartoons, with hand-drawn animation and punishing boss fights.",
    longDescription:
      "Cuphead follows Cuphead and his brother Mugman as they attempt to repay a debt to the Devil by collecting the soul contracts of runaway debtors. Every level is a boss fight or gauntlet, each with multiple phases and attack patterns to master.\n\nThe visual presentation is the game's defining feature — every frame is hand-drawn and hand-inked in the style of Fleischer Studios cartoons from the 1930s. The jazz and big band soundtrack is recorded with period-authentic instruments. Together they create an experience unlike anything else in gaming.\n\nDespite its charming appearance, Cuphead is demanding at its core. Deaths are frequent and lessons are hard-earned, but the satisfaction of finally clearing a boss is immense. The Delicious Last Course DLC adds another island of content with Ms. Chalice.",
    tags: ["run-and-gun", "boss-rush", "hand-drawn", "challenging", "1930s-animation"],
    featured: false,
    genres: ["Action", "Adventure"],
    platforms: ["PC", "Xbox One", "Nintendo Switch", "PlayStation 4"],
  },
  {
    title: "Dead Cells",
    developer: "Motion Twin",
    publisher: "Motion Twin",
    releaseDate: new Date("2018-08-06"),
    rating: 8.9,
    price: 99000,
    description:
      "A roguelike metroidvania in which a failed experiment fights through an ever-changing island prison.",
    longDescription:
      "Dead Cells blends the fast-paced combat of a roguelike with the exploration of a metroidvania, set inside a sprawling, procedurally generated castle full of enemies, traps, and secrets. You play as a nameless blob animating a headless corpse, fighting toward the island's summit.\n\nEach run provides a randomized selection of weapons, abilities, and mutations that combine in surprising ways, pushing you to adapt your playstyle constantly. Permanent unlocks carry over between deaths, ensuring steady progression even across failed runs.\n\nMotion Twin continues to update Dead Cells years after launch with free and paid content drops adding new biomes, weapons, enemies, and story. The result is one of the most content-rich roguelikes ever made.",
    tags: ["roguelike", "metroidvania", "indie", "replayable", "challenging"],
    featured: false,
    genres: ["Action", "RPG"],
    platforms: ["PC", "PlayStation 4", "Nintendo Switch", "iOS", "Android"],
  },
  {
    title: "Civilization VI",
    developer: "Firaxis Games",
    publisher: "2K Games",
    releaseDate: new Date("2019-11-22"),
    rating: 9.0,
    price: 299000,
    description:
      "Build an empire to stand the test of time in the acclaimed 4X turn-based strategy series.",
    longDescription:
      "Civilization VI tasks you with guiding a civilization from the ancient era to the information age, building cities, researching technologies, forging alliances, and waging wars to achieve one of several victory conditions. The Unstacked Cities system fundamentally changes how settlements are planned and grown.\n\nEach of the 40-plus leaders plays uniquely, with distinct agendas, bonuses, and units that encourage diverse playstyles. The two major expansions, Rise and Fall and Gathering Storm, add seasons, climate change, governors, loyalty systems, and the full spectrum of natural disasters.\n\nCivilization VI is endlessly replayable by design. No two games are the same, and the tension of a late-game lead threatened by a rising rival civilization is a feeling it delivers consistently across hundreds of hours.",
    tags: ["turn-based-strategy", "4x", "building", "historical", "multiplayer"],
    featured: false,
    genres: ["Strategy", "Simulation"],
    platforms: ["PC", "PlayStation 4", "Nintendo Switch", "iOS", "Android"],
  },
  {
    title: "NBA 2K24",
    developer: "Visual Concepts",
    publisher: "2K Sports",
    releaseDate: new Date("2023-09-08"),
    rating: 7.2,
    price: 199000,
    description:
      "The annual basketball simulation returns with a Kobe Bryant tribute and the ProPlay visual technology.",
    longDescription:
      "NBA 2K24 honours Kobe Bryant as its cover athlete, dedicating its Mamba Moments career story mode to recreating iconic moments from his legendary 20-season career. ProPlay technology captures real NBA footage to drive animations, resulting in more authentic player movement.\n\nMyCareer, MyTeam, and the expanded City mode return alongside updated rosters, improved AI defensive positioning, and refined shooting mechanics. New badge systems allow greater build customization for the online and offline career modes.\n\nWhile the game's microtransaction model continues to draw criticism from long-time fans, NBA 2K24 remains the most technically refined basketball simulation available, delivering the best on-court experience in the series.",
    tags: ["basketball", "sports", "online", "career", "multiplayer"],
    featured: false,
    genres: ["Sports"],
    platforms: ["PC", "PlayStation 5", "PlayStation 4", "Xbox Series X"],
  },
  {
    title: "Street Fighter 6",
    developer: "Capcom",
    publisher: "Capcom",
    releaseDate: new Date("2023-06-02"),
    rating: 9.2,
    price: 449000,
    description:
      "A bold reinvention of the legendary fighting series with a new Drive system and World Tour mode.",
    longDescription:
      "Street Fighter 6 launches Capcom's flagship fighting game series into a new era with the Drive System, a universal meter that powers five distinct mechanics including parries, charges, overdrives, and reversals. Every character can access these tools, creating a richer meta than any previous entry.\n\nWorld Tour is a full single-player story mode set in a living open world, allowing players to create a custom avatar and train under masters from the roster. Battle Hub serves as a virtual arcade lobby where players fight for ranked positions on actual arcade cabinets.\n\nCapcom delivered the complete package with Street Fighter 6. Excellent rollback netcode, deep tutorial content, multiple control schemes, and a steady post-launch roster expansion make it the best entry point for newcomers and the most satisfying title for veterans.",
    tags: ["fighting", "competitive", "online", "2d", "arcade"],
    featured: false,
    genres: ["Fighting"],
    platforms: ["PC", "PlayStation 5", "PlayStation 4", "Xbox Series X"],
  },
  {
    title: "Returnal",
    developer: "Housemarque",
    publisher: "Sony Interactive Entertainment",
    releaseDate: new Date("2021-04-30"),
    rating: 8.8,
    price: 299000,
    description:
      "An astronaut is trapped in a time loop on a hostile alien planet, reliving her death with every failure.",
    longDescription:
      "Returnal follows Selene, a space scout who crash-lands on the alien world Atropos and discovers her own corpse at the crash site. Each death resets the alien ruins around her, but fragments of memory and upgrades persist, slowly unraveling a fragmented psychological mystery.\n\nThe third-person bullet-hell combat is fast and demanding, requiring mastery of dodge timing, weapon proficiency, and parasitic risk-reward modifiers. The procedurally generated maps ensure each run feels distinct even as the story draws toward its conclusion.\n\nHousemarque fused the roguelike loop with a genuinely mysterious narrative in a way few games have managed. Returnal is relentlessly difficult, but its moment-to-moment gameplay is some of the most kinetically satisfying in the medium.",
    tags: ["roguelike", "souls-like", "atmospheric", "sci-fi", "challenging"],
    featured: false,
    genres: ["Action", "Horror"],
    platforms: ["PlayStation 5", "PC"],
  },
  {
    title: "Monster Hunter World",
    developer: "Capcom",
    publisher: "Capcom",
    releaseDate: new Date("2018-08-09"),
    rating: 9.0,
    price: 149000,
    description:
      "Track, trap, and slay enormous monsters across a seamlessly connected living ecosystem.",
    longDescription:
      "Monster Hunter: World brings the beloved hunting series to a fully realized open world for the first time, replacing discrete zones with seamless environments where monsters roam, feed, fight, and interact with one another. The New World's ecology is the game's greatest achievement.\n\nFourteen weapon types each play completely differently, offering enough variety to sustain hundreds of hours of playtime. Solo and four-player co-op hunts scale dynamically, and the loop of hunting, crafting new gear from materials, and taking on stronger monsters is relentlessly compelling.\n\nCapcom's bold redesign brought the series to a massive new global audience. The Iceborne expansion more than doubled the content, adding a new snowy continent, master rank quests, and dozens of additional monsters.",
    tags: ["hunting", "co-op", "crafting", "open-world", "boss-fights"],
    featured: false,
    genres: ["Action", "RPG"],
    platforms: ["PC", "PlayStation 4", "Xbox One"],
  },
  {
    title: "Phasmophobia",
    developer: "Kinetic Games",
    publisher: "Kinetic Games",
    releaseDate: new Date("2020-09-18"),
    rating: 8.5,
    price: 99000,
    description:
      "A co-op paranormal investigation game where teams gather evidence to identify the type of ghost haunting a location.",
    longDescription:
      "Phasmophobia tasks one to four players with entering haunted locations — houses, schools, prisons, and farms — equipped with ghost-hunting tools like EMF readers, spirit boxes, and UV torches. The goal is to identify the specific type of ghost before it turns deadly.\n\nThe ghost AI is reactive and unpredictable. Ghosts respond to your voice, your movement, and your presence in ways that keep every investigation tense. As evidence mounts and a hunt begins, survival becomes the immediate priority over completion.\n\nKinetic Games developed Phasmophobia as a solo project and it became one of the biggest breakout hits in co-op horror. Consistent updates have added new ghost types, locations, equipment, and difficulty levels since its early access launch.",
    tags: ["horror", "co-op", "ghost-hunting", "first-person", "atmospheric"],
    featured: false,
    genres: ["Horror", "Simulation"],
    platforms: ["PC"],
  },
  {
    title: "Overwatch 2",
    developer: "Blizzard Entertainment",
    publisher: "Blizzard Entertainment",
    releaseDate: new Date("2022-10-04"),
    rating: 7.8,
    price: 0,
    description:
      "A free-to-play hero shooter sequel with 5v5 combat and an expanded roster of unique heroes.",
    longDescription:
      "Overwatch 2 replaces its predecessor with a free-to-play model, transitioning from 6v6 to 5v5 and restructuring the tank role to create faster, more decisive team fights. New heroes including Sojourn, Junker Queen, and Ramattra bring fresh mechanics to the roster.\n\nPush joins the existing Escort and Control game modes, tasking both teams with controlling a robot that advances toward the opponent's base. Seasonal battle passes introduce new heroes, skins, and cosmetic rewards on a regular cadence.\n\nThe shift to free-to-play significantly expanded the player base, though the monetization model drew criticism from fans of the original. On a pure gameplay level, Overwatch 2 delivers one of the most polished hero shooter experiences available.",
    tags: ["fps", "hero-shooter", "team-based", "online", "competitive"],
    featured: false,
    genres: ["Action", "Sports"],
    platforms: ["PC", "PlayStation 5", "PlayStation 4", "Xbox Series X", "Nintendo Switch"],
  },
  {
    title: "Forza Horizon 4",
    developer: "Playground Games",
    publisher: "Xbox Game Studios",
    releaseDate: new Date("2018-10-02"),
    rating: 9.1,
    price: 199000,
    description:
      "An open-world racing game set in a beautiful recreation of Britain with dynamic seasonal changes.",
    longDescription:
      "Forza Horizon 4 sets its open-world festival across a stunning recreation of Britain, spanning Edinburgh, the Lake District, the Cotswolds, and more. The landmark innovation is its dynamic seasons system, which shifts the world's weather, terrain, and available events every real-world week.\n\nOver 450 cars at launch span the full range from everyday hot hatches to hypercar exotica, all recreated in exacting detail. The shared open world allows players to see and interact with other drivers in real time, blurring the line between solo and multiplayer play.\n\nPlayground Games set a new benchmark for the racing genre with Forza Horizon 4. Its seasonal structure created a living world that rewarded regular return visits, and its technical execution on PC and Xbox remains exceptional.",
    tags: ["racing", "open-world", "seasonal", "cars", "online"],
    featured: false,
    genres: ["Racing", "Simulation"],
    platforms: ["PC", "Xbox One"],
  },
  {
    title: "Baldurs Gate 3",
    developer: "Larian Studios",
    publisher: "Larian Studios",
    releaseDate: new Date("2023-08-03"),
    rating: 9.7,
    price: 449000,
    description:
      "An epic turn-based RPG set in the Forgotten Realms, where a mind flayer parasite threatens to change everything.",
    longDescription:
      "Baldur's Gate 3 drops the player and up to three companions into the Forgotten Realms after they are infected with a mind flayer tadpole that should transform them into monsters. Instead of succumbing, the parasite grants strange powers, and the hunt for a cure leads into a conspiracy of world-ending scale.\n\nBuilt on a deeply faithful adaptation of Dungeons and Dragons 5th Edition rules, the game offers unparalleled freedom of choice. Every quest has multiple solutions, every character can be talked, tricked, or fought, and the branching narrative tracks thousands of player decisions across three substantial acts.\n\nLarian Studios created the RPG by which all others will be measured for years to come. Baldur's Gate 3 is a singular achievement in storytelling, systems design, and sheer creative ambition, setting a new standard for what the genre can accomplish.",
    tags: ["turn-based", "rpg", "co-op", "story-driven", "dnd"],
    featured: true,
    genres: ["RPG", "Strategy"],
    platforms: ["PC", "PlayStation 5"],
  },
];

async function seed() {
  const genreMap: Record<string, string> = {};

  for (const name of GENRES) {
    const slug = generateSlug(name);
    const result = await db.genre.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    });
    genreMap[name] = result.id;
  }

  const platformMap: Record<string, string> = {};

  for (const name of PLATFORMS) {
    const slug = generateSlug(name);
    const result = await db.platform.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    });
    platformMap[name] = result.id;
  }

  const passwordHash = await hashPassword(ADMIN.password);
  await db.user.upsert({
    where: { email: ADMIN.email },
    update: {},
    create: {
      name: ADMIN.name,
      email: ADMIN.email,
      password: passwordHash,
      role: ADMIN.role,
    },
  });

  for (const game of GAMES) {
    const { genres, platforms, ...gameData } = game;
    const slug = generateSlug(gameData.title);

    await db.game.upsert({
      where: { slug },
      update: {},
      create: {
        ...gameData,
        slug,
        coverImage: `https://picsum.photos/seed/${slug}/400/600`,
        screenshots: [
          `https://picsum.photos/seed/${slug}-1/1280/720`,
          `https://picsum.photos/seed/${slug}-2/1280/720`,
          `https://picsum.photos/seed/${slug}-3/1280/720`,
        ],
        genres: {
          create: genres.map((name) => ({
            genre: { connect: { id: genreMap[name] } },
          })),
        },
        platforms: {
          create: platforms.map((name) => ({
            platform: { connect: { id: platformMap[name] } },
          })),
        },
      },
    });
  }

  await db.$disconnect();
}

seed().catch(async (err) => {
  console.error(err);
  await db.$disconnect();
  process.exit(1);
});
