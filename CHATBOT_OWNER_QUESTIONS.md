# Chat assistant: questions for the owner

When the website chat assistant can't answer something, it replies "I don't have
an answer for that one yet. Send us a message and we'll get back to you." Each
time, the question is logged in Vercel Analytics as the event
**Chatbot unanswered**. Check there to see what people ask that isn't covered.

## How to add or change an answer (no code needed)

1. Open Sanity Studio (`/studio`) and create or edit a **FAQ**.
2. Fill in the question, the answer, and a category.
3. In **Chat assistant keywords**, add the words people would use, e.g.
   `smoking`, `vape`. A keyword also matches longer words that start with it,
   so `vape` matches "vaping".
4. Publish. The FAQ page and the chat assistant both pick it up within an hour.

## Still needs an answer

Topic names in brackets match the `topic` value in the analytics event.

- [smoking] What's the smoking / vaping policy (including the patio)?
- [outside-cake] Can people bring a birthday cake or cupcakes?

## Answered (now live on the FAQ page and in the chat)

These were written from your answers. Edit any of them in Studio if the wording
is off.

| FAQ question | Answer |
|---|---|
| Do you sell beer to go? | Yes — we sell 4-packs of select beers to go. |
| Do you sell gift cards? | Yes — gift cards are available in person and online. |
| What forms of payment do you take? | Cash, credit and debit cards, and tap to pay, including Apple Pay and Google Pay. With tap to pay, we can't keep a tab open — you'll close out each time. |
| Can I open a tab? | Added the same tap-to-pay note to the existing answer. |
| Can we split the check? | Yes — groups can split the check or pay on separate cards. |
| Do you have a happy hour or daily specials? | No — we don't run a happy hour, daily specials, or discounts. |
| Are you wheelchair accessible? | Yes — both locations, including the entrances and restrooms. |
| Do you have high chairs or a changing table? | Yes — high chairs, boosters, and a changing table. |
| Do you have a kids menu? | No — no kids menu or kid-size options. |
| Do you have TVs? Do you show the Packers game? | Yes — TVs, Packers games, and other sports. |
| Do you have Wi-Fi? | Yes — guest Wi-Fi. |
| Do you have games? | Yes — board games, cards, and more. |
| How busy does it get? | It can get pretty busy; for groups, arrive a little early and hold tables (up to 3). |
| Do you have a patio? | Appleton: outside patio. Menomonee Falls: back patio. Seasonal, not heated. Leashed dogs welcome. |
| How old do you have to be to drink? | You must be 21 or older to be served alcohol. (The 18-with-parent exception is left off, as you asked.) |
| I left something behind. What should I do? | Send us a message with what you left and which location. |
| Do you serve cocktails or liquor? | Some ready-to-drink (RTD) cocktails, along with beer, wine, cider, and seltzer. |
| Do you offer brewery tours? | No. |
| Do you cater? | No — we don't cater off-site. |
| How do I ask about donations, fundraisers, or sponsorships? | Send us a message with the details. |
| How can my band play at Hop Yard? | Send us a message through the contact form. |

Corrected existing answers:

- **Parking:** Appleton has on-site parking; Menomonee Falls has street parking
  and a nearby lot.
- **Outside food or drinks:** removed the wristband sentence.
- **Local ingredients:** now says "At our Appleton location, yes."

## Worth a quick look

- **High chairs:** the question asked about high chairs, boosters, *or* a
  changing table and you said yes, so the answer lists all three. Remove any
  you don't have.
- **Gift cards "online":** if they're sold through Toast or another site, adding
  the link to the answer would help.
- Most answers don't name a location. If something is true at only one
  location, say so in the answer.
