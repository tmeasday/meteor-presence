// Set `Meteor.Presence.state` to keep track of what users are doing.
//
// This function will be called a) reactively, b) every 1 second
//
var computation = null;
var interval = null;
var INTERVAL = 1000;
if (typeof Meteor.settings !== "undefined" && typeof Meteor.settings.public !== "undefined"){
  INTERVAL = Meteor.settings.public.presenceInterval || INTERVAL;
}
Meteor.Presence = {
  // The presnce will contained in, which will be reset to null
  // when they close the browser tab or log off
  state: function() { return 'online'; },

  // we get told about the sessionId by the server, track it here so we
  // overwrite the correct thing
  // XXX: should probably use a session var for this so it survives HCR
  // but it causes some complexities with loops below, so I'll skip for now.
  sessionId: '',

  // call this function to manually update the presence _right_ now
  // use this if your state() function contains non-reactive elements that have
  // changed
  update: function() {
    Session.set('last-presence-set-at', new Date());
  },

  start: function(){
    Meteor.Presence.stop();
    // update presences every interval
    interval = Meteor.setInterval(function() {
      Meteor.Presence.update();
    }, INTERVAL);
    // this is code that actually does it.
    computation = Meteor.autorun(refreshPresence);
  },

  stop: function(){
    if (computation !== null) {
      computation.stop();
      computation = null;
    }
    if (interval !== null){
      Meteor.clearInterval(interval);
      interval = null;
    }
  }
};

var abortedWhileWaiting = false;
function refreshPresence() {
  // read the state, so context is invalidated every time it changes
  var state = Meteor.Presence.state();
  // read this, so the context is invalidated every time the interval changes
  Session.get('last-presence-set-at');

  // also read userId so context is invalidated as soon as login state changes
  Meteor.userId();

  // check if waiting for Meteor.call to return
  if (Meteor.Presence.sessionId === 'waiting'){
    abortedWhileWaiting = true;
    return;
  } else {
    // we can clear the abort flag, as this will be successful
    abortedWhileWaiting = false;
  }

  Meteor.call('setPresence',
    Meteor.Presence.sessionId,
    state, function(err, sessionId) {
      if (err) {
        console.log('setPresence returned error:', err);
        Meteor.Presence.sessionId = '';
        return;
      }
      Meteor.Presence.sessionId = sessionId;
      if (abortedWhileWaiting){
        refreshPresence()
      }
    }
  );
  // set the sessionId to 'waiting' if it's empty
  Meteor.Presence.sessionId = Meteor.Presence.sessionId || 'waiting';
}

// try to maintain sessionId across hot-code-reload
if (Meteor._reload) {
  Meteor._reload.onMigrate('presence', function () {
    return [true, {sessionId: Meteor.Presence.sessionId}];
  });

  (function () {
    var migrationData = Meteor._reload.migrationData('presence');
    if (migrationData && migrationData.sessionId) {
      Meteor.Presence.sessionId = migrationData.sessionId;
    }
  })();
}
// wait until startup so that client code can set their own state function
Meteor.startup(function(){
  Meteor.Presence.start();
});
