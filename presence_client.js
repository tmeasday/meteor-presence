PRESENCE_INTERVAL = 1000;

// Set `Meteor.Presence.state` to keep track of what users are doing.
//
// This function will be called a) reactively, b) every 1 second
//
Meteor.Presence = {
  // The presnce will contained in, which will be reset to null
  // when they close the browser tab or log off
  state: function() { return 'online'; },
  
  // we get told about the sessionId by the server, track it here so we
  // overwrite the correct thing
  // XXX: should probably use a session var for this so it survives HCR
  // but it causes some complexities with loops below, so I'll skip for now.
  sessionId: null,
  
  // call this function to manually update the presence _right_ now
  // use this if your state() function contains non-reactive elements that have 
  // changed
  update: function() {
    Session.set('last-presence-set-at', new Date());
  }
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

// update presences every interval
Meteor.setInterval(function() {
  Meteor.Presence.update();
}, PRESENCE_INTERVAL);

// this is code that actually does it.
Meteor.autorun(function() {
  // read this, so the context is invalidated every time the interval changes
  Session.get('last-presence-set-at');
  
  // also read userId so context is invalidated as soon as login state changes
  Meteor.userId();
  
  // if we have made our first call, but it hasn't yet returned, 
  // don't make another
  if (Meteor.Presence.sessionId === 'waiting')
    return;
  
  Meteor.call('setPresence', 
    Meteor.Presence.sessionId, 
    Meteor.Presence.state(), function(err, sessionId) {
      if (err) {
        console.log(err);
        return;
      }
      
      // console.log(Meteor.Presence.sessionId, sessionId);
      Meteor.Presence.sessionId = sessionId;
    }
  );
  Meteor.Presence.sessionId = Meteor.Presence.sessionId || 'waiting';
});
