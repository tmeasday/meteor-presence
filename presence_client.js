PRESENCE_INTERVAL = 1000;

// Set `Meteor.Presence.state` to keep track of what users are doing.
//
// This function will be called a) reactively, b) every 1 second
//
// The user will be decorated with the state, which will be reset to null
// when they close the browser tab or log off
Meteor.Presence = {
  state: function() { return 'online'; }
}

Meteor.setInterval(function() {
  Session.set('last-presence-set-at', new Date());
}, PRESENCE_INTERVAL);


Meteor.autorun(function() {
  // read this, so the context is invalidated every time the interval changes
  Session.get('last-presence-set-at');
  
  Meteor.call('setPresence', Meteor.Presence.state());
});

