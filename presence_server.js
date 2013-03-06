PRESENCE_TIMEOUT_MS = 10000;
PRESENCE_INTERVAL = 1000;

// a method to indicate that the user is still online
Meteor.methods({
  setPresence: function(sessionId, state) {
    var update = {$set: {
        state: state,
        lastSeen: new Date()
    }};
    
    // need to unset userId if it's not defined as they may have just logged out
    var userId = Meteor.userId()
    if (userId) {
      update.$set.userId = userId;
    } else {
      update.$unset = {userId: true};
    }
    
    Meteor.presences.update({
      sessionId: sessionId
    }, update, {
      upsert: true
    });
  }
});

Meteor.setInterval(function() {
  var since = new Date(new Date().getTime() - PRESENCE_TIMEOUT_MS);
  Meteor.presences.remove({lastSeen: {$lt: since}});
}, PRESENCE_INTERVAL);