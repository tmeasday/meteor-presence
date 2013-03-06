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
  sessionId: Meteor.uuid(),
  
  // call this function to manually update the presence _right_ now
  // use this if your state() function contains non-reactive elements that have 
  // changed
  update: function() {
    Session.set('last-presence-set-at', new Date());
  }
}

Meteor.setInterval(function() {
  Meteor.Presence.update();
}, PRESENCE_INTERVAL);


Meteor.autorun(function() {
  // read this, so the context is invalidated every time the interval changes
  Session.get('last-presence-set-at');
  
  // also read userId so context is invalidated as soon as login state changes
  Meteor.userId();
  
  Meteor.call('setPresence', Meteor.Presence.sessionId, Meteor.Presence.state());
});

