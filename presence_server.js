PRESENCE_TIMEOUT_MS = 10000;
PRESENCE_INTERVAL = 1000;

// a method to indicate that the user is still online
Meteor.methods({
  setPresence: function(state) {
    if (Meteor.userId()) {
      Meteor.users.update(Meteor.userId(), {$set: {presence: {
        state: state,
        lastSeen: new Date()
      }}});
    }
  }
});

Meteor.setInterval(function() {
  
  // set all users who we haven't seen for a while to not be present
  var match = {
    'presence.lastSeen': {$lt: new Date(new Date().getTime() - PRESENCE_TIMEOUT_MS)},
    'presence.state': {$exists: true}
  };
  
  Meteor.users.update(match, {$unset: {'presence.state': true}});
}, PRESENCE_INTERVAL);