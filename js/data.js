export const DEMO_CODE = "482915";

/** Built-in account for local testing (no backend yet). */
export const DEV_ACCOUNT = {
  username: "dev",
  password: "dev1234",
  displayName: "DEV Tester",
  fullName: "Developer",
  middleName: "QA",
  lastName: "Account",
  email: "dev@liveph.test",
  phone: "+63 917 000 0001",
  hideRealName: true,
  verifyVia: "email",
  coins: 99999,
  totalRecharged: 0,
  followers: 12,
};

export const LIVE_STREAMS = [
  {
    id: "l1",
    host: "Mia Santos",
    handle: "@mia_live",
    title: "Sunset acoustic & chat",
    category: "music",
    viewers: 1284,
    a: "#ff5a4f",
    b: "#f0c27a",
  },
  {
    id: "l2",
    host: "KJ Plays",
    handle: "@kjplays",
    title: "Ranked push â€” come vibe",
    category: "gaming",
    viewers: 892,
    a: "#2ec4b6",
    b: "#1a6b8c",
  },
  {
    id: "l3",
    host: "Luna PH",
    handle: "@lunaph",
    title: "Late-night stories",
    category: "chat",
    viewers: 654,
    a: "#ff7a45",
    b: "#c44569",
  },
  {
    id: "l4",
    host: "DJ Nova",
    handle: "@djnova",
    title: "OPM remix live mix",
    category: "music",
    viewers: 2103,
    a: "#f0c27a",
    b: "#ff5a4f",
  },
  {
    id: "l5",
    host: "Ara Stream",
    handle: "@arastream",
    title: "Just chatting & gifts",
    category: "chat",
    viewers: 431,
    a: "#2ec4b6",
    b: "#ff7a45",
  },
  {
    id: "l6",
    host: "Team Void",
    handle: "@teamvoid",
    title: "Tournament warm-up",
    category: "gaming",
    viewers: 1502,
    a: "#1a6b8c",
    b: "#2ec4b6",
  },
  {
    id: "l7",
    host: "Coach Rex",
    handle: "@coachrex",
    title: "Fitness Q&A stretch session",
    category: "chat",
    viewers: 318,
    a: "#3d8b6e",
    b: "#f0c27a",
  },
];

/** Demo streams currently in a PK battle (shown on the Live tab). */
export const DEMO_PK_LIVES = [
  { streamId: "l1", left: "Mia Santos", right: "DJ Nova" },
  { streamId: "l2", left: "KJ Plays", right: "Team Void" },
  { streamId: "l6", left: "Team Void", right: "Kai" },
];

export const FEED_POSTS = [
  {
    id: 1,
    author: "Mia Santos",
    handle: "@mia_live",
    initials: "MS",
    time: "12m",
    text: "Going live in 10 minutes â€” acoustic set + shoutouts. Drop a gift if you want a song!",
    likes: 218,
    comments: 34,
    isLive: true,
    streamId: "l1",
  },
  {
    id: 2,
    author: "KJ Plays",
    handle: "@kjplays",
    initials: "KJ",
    time: "1h",
    text: "Ranked grind tonight. First 50 viewers get a free spin gift from me.",
    likes: 512,
    comments: 89,
    isLive: true,
    streamId: "l2",
  },
  {
    id: 3,
    author: "Luna PH",
    handle: "@lunaph",
    initials: "LP",
    time: "3h",
    text: "Thank you for the love yesterday! New live schedule posted on my profile.",
    likes: 940,
    comments: 120,
    isLive: true,
    streamId: "l3",
  },
  {
    id: 4,
    author: "Coach Rex",
    handle: "@coachrex",
    initials: "CR",
    time: "5h",
    text: "Fitness Q&A live later. Bring your questions â€” Iâ€™ll answer while we stretch.",
    likes: 176,
    comments: 41,
    isLive: true,
    streamId: "l7",
  },
];

export const COIN_PACKS = [
  { id: "p1", coins: 50, pesos: 50, bonus: 0 },
  { id: "p2", coins: 100, pesos: 100, bonus: 0 },
  { id: "p3", coins: 300, pesos: 300, bonus: 0 },
  { id: "p4", coins: 500, pesos: 500, bonus: 50 },
  { id: "p5", coins: 1000, pesos: 1000, bonus: 100 },
  { id: "p6", coins: 5000, pesos: 5000, bonus: 200 },
];

export const GIFT_LIST = [
  { id: "g1", name: "Rose", cost: 10, desc: "A simple hello" },
  { id: "g2", name: "Star", cost: 50, desc: "Show some love" },
  { id: "g3", name: "Heart", cost: 100, desc: "Fan favorite" },
  { id: "g4", name: "Crown", cost: 500, desc: "Make them royalty" },
  { id: "g5", name: "Diamond", cost: 1000, desc: "Top supporter" },
  { id: "g6", name: "Rocket", cost: 2500, desc: "Blow up the room" },
  { id: "g7", name: "Castle", cost: 5000, desc: "Ultimate gift" },
  { id: "g8", name: "Galaxy", cost: 10000, desc: "Legendary support" },
];

export const CHAT_VIEWERS = [
  "Andi",
  "Kai",
  "Nina",
  "Jom",
  "Bea",
  "Lex",
  "Yuri",
  "Sam",
  "Ria",
  "Theo",
];

/** Demo presence, VIP spend, and social counts for chat users / hosts. */
export const CHAT_USERS = {
  Andi: { online: true, totalRecharged: 100, followers: 128, following: 54, showFollowLists: true, avatarColor: "#2ec4b6", album: ["#2ec4b6", "#ff7a45", "#f0c27a"] },
  Kai: { online: true, totalRecharged: 250, followers: 402, following: 88, showFollowLists: true, avatarColor: "#ff7a45", album: ["#ff5a4f", "#1a6b8c"] },
  Nina: { online: false, totalRecharged: 0, followers: 67, following: 120, showFollowLists: false, avatarColor: "#c44569", album: ["#c44569"] },
  Jom: { online: true, totalRecharged: 500, followers: 890, following: 41, showFollowLists: true, avatarColor: "#f0c27a", album: ["#f0c27a", "#ff5a4f", "#2ec4b6"] },
  Bea: { online: true, totalRecharged: 149, followers: 210, following: 95, showFollowLists: true, avatarColor: "#ff5a4f", album: ["#ff5a4f", "#f0c27a"] },
  Lex: { online: false, totalRecharged: 0, followers: 33, following: 70, showFollowLists: true, avatarColor: "#1a6b8c", album: [] },
  Yuri: { online: true, totalRecharged: 300, followers: 560, following: 112, showFollowLists: true, avatarColor: "#3d8b6e", album: ["#3d8b6e", "#2ec4b6"] },
  Sam: { online: true, totalRecharged: 49, followers: 91, following: 60, showFollowLists: true, avatarColor: "#7a8cff", album: ["#7a8cff"] },
  Ria: { online: false, totalRecharged: 200, followers: 175, following: 140, showFollowLists: false, avatarColor: "#c44569", album: ["#c44569", "#ff7a45"] },
  Theo: { online: true, totalRecharged: 800, followers: 1204, following: 36, showFollowLists: true, avatarColor: "#ff5a4f", album: ["#ff5a4f", "#f0c27a", "#2ec4b6"] },
  "Mia Santos": { online: true, totalRecharged: 1200, followers: 15400, following: 82, showFollowLists: true, avatarColor: "#ff5a4f", album: ["#ff5a4f", "#f0c27a", "#ff7a45", "#2ec4b6"] },
  "KJ Plays": { online: true, totalRecharged: 450, followers: 9800, following: 120, showFollowLists: true, avatarColor: "#2ec4b6", album: ["#2ec4b6", "#1a6b8c"] },
  "Luna PH": { online: true, totalRecharged: 99, followers: 6200, following: 200, showFollowLists: true, avatarColor: "#ff7a45", album: ["#ff7a45", "#c44569"] },
  "DJ Nova": { online: true, totalRecharged: 2000, followers: 22100, following: 55, showFollowLists: true, avatarColor: "#f0c27a", album: ["#f0c27a", "#ff5a4f", "#2ec4b6"] },
  "Ara Stream": { online: false, totalRecharged: 0, followers: 1800, following: 310, showFollowLists: false, avatarColor: "#2ec4b6", album: ["#2ec4b6"] },
  "Team Void": { online: true, totalRecharged: 350, followers: 7400, following: 44, showFollowLists: true, avatarColor: "#1a6b8c", album: ["#1a6b8c", "#2ec4b6"] },
  "Coach Rex": { online: true, totalRecharged: 180, followers: 4300, following: 99, showFollowLists: true, avatarColor: "#3d8b6e", album: ["#3d8b6e", "#f0c27a"] },
};

export const DM_REPLY_LINES = [
  "Hey! Thanks for messaging.",
  "I'm watching this live too!",
  "Nice to meet you here.",
  "Haha yes!",
  "Sure, what's up?",
  "I'll reply more later - still in the live.",
  "That sounds fun!",
  "Are you sending gifts too?",
  "Online and chatting with you only.",
  "Got your message!",
];

export const CHAT_LINES = [
  "Hello from Manila!",
  "Ang ganda ng live",
  "First time here, hi!",
  "Send a Rose guys",
  "Who else is watching?",
  "Love this vibe",
  "Can you play one more?",
  "Gift incoming!",
  "Good evening!",
  "Support the streamer",
  "Wow nice set",
  "I'm here for the chat",
  "Let's gooo",
  "Following now",
  "Shoutout please?",
];

export const STORY_HOSTS = LIVE_STREAMS.slice(0, 6).map((s) => ({
  name: s.host.split(" ")[0],
  initials: s.host
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2),
}));



