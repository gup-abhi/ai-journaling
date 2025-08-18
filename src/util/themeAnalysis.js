import lda from 'lda';

function themeAnalysis(text) {
    const documents = text.match( /[^\.!\?]+[\.!\?]+/g );
    const result = lda(documents, 2, 5);
    console.log("Theme analysis result:", result);
    return result;
}

themeAnalysis(`# Daily Journal Entry
**Date:** Sunday, August 17, 2025

## Morning Reflections
Woke up around 7:30 AM feeling surprisingly refreshed after getting a solid 8 hours of sleep. The first thing I noticed was the gentle sunlight streaming through my bedroom window - there's something magical about Sunday morning light that feels different from weekday mornings. Less urgent, more forgiving.

Made my usual coffee (trying that new Ethiopian blend I picked up last week) and spent about 20 minutes just sitting on the balcony, watching the world slowly come alive. A few joggers passed by, a neighbor was walking their golden retriever, and I could hear the distant sound of church bells. These quiet moments feel like a luxury in our always-connected world.

## Today's Intentions
- Finish reading "The Seven Husbands of Evelyn Hugo" (only 50 pages left!)
- Call Mom and Dad - it's been over a week since we properly talked
- Meal prep for the week ahead
- Take that nature walk I've been promising myself
- Work on my photography project for an hour

## What Happened Today
The morning unfolded exactly as I hoped. Finished the book over breakfast - what an emotional ending! Made some notes in my reading journal about the themes of identity and sacrifice that really resonated with me.

Called my parents around 11 AM. Dad shared updates about his garden (the tomatoes are apparently "the size of softballs this year"), and Mom told me about her new book club. These conversations remind me how much I miss the simple comfort of family connection. We made tentative plans for me to visit next month.

Spent the afternoon at Riverside Park. The fall colors are just starting to show - subtle hints of gold and red mixed in with the green. Took some photos of the old oak tree near the pond. There's something about that tree that draws me back every season. Maybe it's the way its roots seem so firmly planted while its branches reach in every direction.

The meal prep session was therapeutic. Made overnight oats for breakfasts, roasted vegetables for lunches, and a big batch of lentil soup that'll last me through Wednesday. There's something deeply satisfying about preparing for the week ahead.

## Challenges & Growth
Had a moment of anxiety around 3 PM when I started thinking about the presentation I have to give on Tuesday. The familiar knot in my stomach, the racing thoughts about all the ways it could go wrong. But I tried that breathing technique Dr. Martinez taught me - four counts in, hold for four, four counts out. It actually helped.

I'm learning that acknowledging anxiety without letting it spiral is a skill that takes practice. Instead of avoiding thoughts about the presentation, I spent 30 minutes outlining my key points. Action, even small action, seems to be the antidote to worry.

## Moments of Gratitude
- The barista at Corner Coffee who remembered my usual order and asked how my week was going
- Finding a new podcast episode from my favorite host waiting in my queue
- The elderly couple I saw holding hands while walking slowly down Main Street
- Having the energy and motivation to take care of future-me with meal prep
- The way evening light hits my living room walls around 6 PM

## Evening Thoughts
As I write this, it's 9:47 PM and I'm feeling centered in a way that doesn't happen every day. Sundays have this unique quality - they're both an ending and a beginning. The end of rest and the preparation for re-engagement with the world.

I've been thinking about how much my relationship with solitude has changed over the past year. I used to fill every quiet moment with noise - music, podcasts, scrolling. Now I'm learning to appreciate the texture of silence, the way thoughts arise and settle when given space.

Tomorrow brings new challenges, but tonight I feel equipped. Not perfect, not without worries, but equipped nonetheless.

## Tomorrow's Focus
- Review presentation materials first thing
- Remember to water the plants (they're looking a bit droopy)
- Text Sarah back about weekend plans
- Continue reading "Atomic Habits" during lunch break

---

*Note to self: Pay attention to how Sunday evening energy affects Monday morning mood. There might be a pattern worth exploring.*`);
