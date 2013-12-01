Meteor.Presence = {};

Meteor.Presence.state = function() {
  return 'online';
};

Meteor.startup(function() {
  Deps.autorun(function() {
    Meteor.call('updatePresence', Meteor.Presence.state());
  });
});
