// ==========================================
// Daily Quotes — Hard-Hitting Hollywood Lines
// ==========================================

export interface Quote {
  text: string;
  author?: string;
}

export const QUOTES: Quote[] = [
  // Rocky Balboa (2006)
  { text: "It ain't about how hard you hit. It's about how hard you can get hit and keep moving forward.", author: "Rocky Balboa" },
  // The Pursuit of Happyness (2006)
  { text: "Don't ever let somebody tell you you can't do something. Not even me.", author: "The Pursuit of Happyness" },
  // The Dark Knight (2008)
  { text: "The night is darkest just before the dawn. And I promise you, the dawn is coming.", author: "The Dark Knight" },
  // The Shawshank Redemption (1994)
  { text: "Get busy living, or get busy dying.", author: "The Shawshank Redemption" },
  // Interstellar (2014)
  { text: "We used to look up at the sky and wonder at our place in the stars. Now we just look down and worry about our place in the dirt.", author: "Interstellar" },
  // Whiplash (2014)
  { text: "There are no two words in the English language more harmful than 'good job'.", author: "Whiplash" },
  // Fight Club (1999)
  { text: "It's only after we've lost everything that we're free to do anything.", author: "Fight Club" },
  // The Wolf of Wall Street (2013)
  { text: "The only thing standing between you and your goal is the story you keep telling yourself as to why you can't achieve it.", author: "The Wolf of Wall Street" },
  // Gladiator (2000)
  { text: "What we do in life echoes in eternity.", author: "Gladiator" },
  // Batman Begins (2005)
  { text: "Why do we fall? So we can learn to pick ourselves up.", author: "Batman Begins" },
  // Dead Poets Society (1989)
  { text: "Carpe diem. Seize the day, boys. Make your lives extraordinary.", author: "Dead Poets Society" },
  // Good Will Hunting (1997)
  { text: "You'll never have that kind of relationship in a world where you're afraid to take the first step because all you see is every negative thing 10 miles down the road.", author: "Good Will Hunting" },
  // Rocky (1976)
  { text: "Every champion was once a contender that refused to give up.", author: "Rocky" },
  // Braveheart (1995)
  { text: "Every man dies, but not every man really lives.", author: "Braveheart" },
  // The Godfather (1972)
  { text: "Great men are not born great, they grow great.", author: "The Godfather" },
  // Scarface (1983)
  { text: "The world is yours.", author: "Scarface" },
  // A Bronx Tale (1993)
  { text: "The saddest thing in life is wasted talent.", author: "A Bronx Tale" },
  // 300 (2006)
  { text: "Give them nothing — but take from them everything.", author: "300" },
  // Any Given Sunday (1999)
  { text: "On any given Sunday you're gonna win or you're gonna lose. The point is, can you win or lose like a man?", author: "Any Given Sunday" },
  // The Social Network (2010)
  { text: "You know what's cooler than a million dollars? A billion dollars.", author: "The Social Network" },
  // Inception (2010)
  { text: "You mustn't be afraid to dream a little bigger, darling.", author: "Inception" },
  // Cinderella Man (2005)
  { text: "I have to believe that when things are bad, I can change them.", author: "Cinderella Man" },
  // Creed (2015)
  { text: "One step at a time. One punch at a time. One round at a time.", author: "Creed" },
  // Coach Carter (2005)
  { text: "Our deepest fear is not that we are inadequate. Our deepest fear is that we are powerful beyond measure.", author: "Coach Carter" },
  // Troy (2004)
  { text: "Men are haunted by the vastness of eternity. And so we ask ourselves: will our actions echo across the centuries?", author: "Troy" },
  // The Prestige (2006)
  { text: "The secret impresses no one. The trick you use it for is everything.", author: "The Prestige" },
  // Gattaca (1997)
  { text: "There is no gene for the human spirit.", author: "Gattaca" },
  // Million Dollar Baby (2004)
  { text: "If there's magic in boxing, it's the magic of fighting battles beyond endurance.", author: "Million Dollar Baby" },
  // V for Vendetta (2005)
  { text: "Beneath this mask there is more than flesh. There is an idea, and ideas are bulletproof.", author: "V for Vendetta" },
  // The Departed (2006)
  { text: "I don't want to be a product of my environment. I want my environment to be a product of me.", author: "The Departed" },
  // Limitless (2011)
  { text: "What kind of a person with zero motivation does something like that? I had powers I didn't even know I had. I could see everything.", author: "Limitless" },
  // American Gangster (2007)
  { text: "The loudest one in the room is the weakest one in the room.", author: "American Gangster" },
  // Django Unchained (2012)
  { text: "You had my curiosity. But now you have my attention.", author: "Django Unchained" },
  // Warrior (2011)
  { text: "You don't knock him out, you lose the fight.", author: "Warrior" },
  // The Revenant (2015)
  { text: "As long as you can still grab a breath, you fight. You breathe. Keep breathing.", author: "The Revenant" },
  // Oppenheimer (2023)
  { text: "Theory will only take you so far.", author: "Oppenheimer" },
  // Joker (2019)
  { text: "The worst part of having a mental illness is people expect you to behave as if you don't.", author: "Joker" },
  // Peaky Blinders (bonus — cult classic)
  { text: "Everyone's a whore, Grace. We just sell different parts of ourselves.", author: "Peaky Blinders" },
  // Shutter Island (2010)
  { text: "Which would be worse — to live as a monster, or to die as a good man?", author: "Shutter Island" },
  // Interstellar (2014)
  { text: "Do not go gentle into that good night. Rage, rage against the dying of the light.", author: "Interstellar" },
];

/**
 * Get a deterministic daily quote based on the current date.
 * Same quote all day, changes at midnight.
 */
export function getDailyQuote(): Quote {
  const now = new Date();
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000
  );
  return QUOTES[dayOfYear % QUOTES.length];
}
