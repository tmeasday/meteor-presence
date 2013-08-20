PRESENCE_TIMEOUT_MS = 10000;
PRESENCE_INTERVAL = 1000;

// a method to indicate that the user is still online
Meteor.methods({
  setPresence: function(sessionId, state, focus) {
    // console.log(sessionId, state);
    check(sessionId, String);
    check(state, Match.Any);
    
    // we use the sessionId to tell if this is a new record or not
    var props = {
        state: state,
        focus: focus,
        lastSeen: new Date()
    };
    
    var userId = _.isUndefined(Meteor.userId) ? null : Meteor.userId();
    
    if (sessionId && Meteor.presences.findOne(sessionId)) {
      var update = {$set: props};
      
      // need to unset userId if it's not defined as they may have just logged out
      if (userId) {
        update.$set.userId = userId;
      } else {
        update.$unset = {userId: true};
      }
      
      Meteor.presences.update({_id: sessionId}, update);
      return sessionId;
    } else {
      props.userId = userId;
      return Meteor.presences.insert(props)
    }
  }
});

Meteor.setInterval(function() {
  var since = new Date(new Date().getTime() - PRESENCE_TIMEOUT_MS);
  Meteor.presences.remove({lastSeen: {$lt: since}});
}, PRESENCE_INTERVAL);
