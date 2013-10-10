
// a method to indicate that the user is still online
Meteor.methods({
  setPresence: function(sessionId, state) {
    // console.log(sessionId, state);
    check(sessionId, String);
    check(state, Match.Any);

    // we use the sessionId to tell if this is a new record or not
    var props = {
        state: state,
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

var interval = null;
var INTERVAL = 1000;
var TIMEOUT = 10000;
if (typeof Meteor.settings !== "undefined"){
  TIMEOUT = Meteor.settings.presenceTimeout || TIMEOUT;
  if (typeof Meteor.settings.public !== "undefined"){
    INTERVAL = Meteor.settings.public.presenceInterval || INTERVAL;
  }
}
Meteor.Presence = {
  INTERVAL: 1000,
  TIMEOUT: 10000,
  start: function(){
    if (interval !== null){
      Meteor.clearInterval(interval)
    }
    interval = Meteor.setInterval(function() {
      var since = new Date(new Date().getTime() - TIMEOUT);
      Meteor.presences.remove({lastSeen: {$lt: since}});
    }, INTERVAL);
  }
};

// wait until startup so that client code can set their own INTERVAL / TIMEOUT
Meteor.startup(function(){
  Meteor.Presence.start();
});

