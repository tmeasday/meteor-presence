PRESENCE_TIMEOUT_MS = 10000;
PRESENCE_INTERVAL = 1000;



// a method to indicate that the user is still online
Meteor.methods({
  setPresence: function(sessionId, state) {
    Meteor.presences.update({
      sessionId: sessionId
    }, {$set: {
      userId: Meteor.userId(),
      state: state,
      lastSeen: new Date()
    }}, {
      upsert: true
    });
  }
});

Meteor.setInterval(function() {
  var since = new Date(new Date().getTime() - PRESENCE_TIMEOUT_MS);
  Meteor.presences.remove({lastSeen: {$lt: since}});
}, PRESENCE_INTERVAL);