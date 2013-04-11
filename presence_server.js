PRESENCE_TIMEOUT_MS = 10000;
PRESENCE_INTERVAL = 1000;

// a method to indicate that the user is still online
Meteor.methods({
  setPresence: function(sessionId, state) {
    // console.log(sessionId, state);
    
    // we use the sessionId to tell if this is a new record or not
    var props = {
        state: state,
        lastSeen: new Date()
    };
    
    if (sessionId) {
      var update = {$set: props};
      
      // need to unset userId if it's not defined as they may have just logged out
      var userId = Meteor.userId()
      if (userId) {
        update.$set.userId = userId;
      } else {
        update.$unset = {userId: true};
      }
      
      Meteor.presences.update({_id: sessionId}, update);
      return sessionId;
    } else {
      props.userId = Meteor.userId();
      return Meteor.presences.insert(props)
    }
  }
});

Meteor.setInterval(function() {
  var since = new Date(new Date().getTime() - PRESENCE_TIMEOUT_MS);
  Meteor.presences.remove({lastSeen: {$lt: since}});
}, PRESENCE_INTERVAL);