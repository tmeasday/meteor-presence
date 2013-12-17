Meteor.Presence = new ClientMonitor()

Meteor.startup ()->
  Meteor.Presence.start()
  return
