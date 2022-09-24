// Fetches the json from an api url
async function fetchJson(url) {
  return await fetch(url).then(data => data.json());
}

// Fetches the data field from a url (not accounting for pagination)
async function fetchData(url) {
  return await fetchJson(url).then(json => json.data);
}

// Fetches all cards from the v2 API (accounting for pagination)
// Returns a list of cards
async function fetchCards(flags='') {
  const data = [];
  let json = await fetch(`${v3_api_url}/api/v3/public/cards/${flags}`).then(data => data.json());
  data.push(...json.data);
  while ('next' in json.links) {
    json = await fetch(json.links.next).then(data => data.json());
    data.push(...json.data);
  }
  return data;
}

// Removes currents from a list of cards
// Assumes the cards have their list of subtypes exposed
function removeCurrents(cards) {
  return cards.filter(c => !c.relationships.card_subtypes.data.map(d => d.id).includes('current'));
}

// Turns a json object containing a list of objects with an ID into a map from IDs to those objects
function makeIdMap(json) {
  const out = new Map();
  json.data.forEach(d => {
    out.set(d.id, d);
  });
  return out;
}

// Filters a list of cards for the one with the given ID
function getCardsById(cards, ids) {
  return cards.filter(card => ids.includes(card.id));
}

// Maps a _=>card_id object to a _=>card object
function getCardsByIdFromObj(cards, obj) {
  return Object.keys(obj).reduce(function(newObj, key) {
    newObj[key] = getCardsById(cards, obj[key])
    return newObj
  }, {});
}

// Splits a list of cards into corp cards and runner cards
function splitBySide(cards) {
  const corp = [];
  const runner = [];
  cards.forEach (card => {
    if (card.attributes.side_id == 'corp')
      corp.push(card);
    else
      runner.push(card);
  });
  return [corp, runner];
}

// Generates a link to a card by creating a link to its most recent printing
function cardToLatestPrintingLink(card) {
  return Routing.generate('cards_zoom', {card_code:card.attributes.latest_printing_id});
}
