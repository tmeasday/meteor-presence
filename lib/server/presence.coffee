Meteor.Presence = new ServerMonitor()

# on any connection - log the client in presences, and set the onClose handler
Meteor.onConnection (connection)->
  connection.sessionKey = Meteor.Presence.generateSessionKey()
  #console.log("[Presence.onConnection(connection)] sessionKey:#{connection.sessionKey}")
  now = new Date()
  Meteor.presences.insert
    _id: connection.sessionKey
    serverId: Meteor.Presence.serverId
    status: 'connecting'
    connectedAt: now
    lastSeen: now
    remoteAddress: null
    state: null
    userId: null

  connection.onClose ()->
    #console.log("[Presence.onClose()] sessionKey:#{connection.sessionKey}")
    Meteor.presences.remove(_id: connection.sessionKey)
    return
  return

# this autopublish will be called each time the user logs out / in
# it should also be the first call after the Meteor.onConnection call
Meteor.publish null, ()->
  #console.log("[Presence.publish(null)] sessionKey:#{@connection.sessionKey} userId:#{@userId}")

  # if this is the "first" connection
  Meteor.presences.update
    _id: @connection.sessionKey
    status: 'connecting'
  ,
    $set:
      status: 'connected'

  Meteor.presences.update
    _id: @connection.sessionKey
  ,
    $set:
      userId: @userId
      lastSeen: new Date()
  return

# allow the client to provide stateful information about itself
Meteor.methods
  'setPresence': (state)->
    check(state, Match.Any)
    #console.log("[Presence.setPresence(state)] sessionKey:#{@connection.sessionKey} userId:#{@userId}", state)

    Meteor.presences.update
      _id: @connection.sessionKey
    ,
      $set:
        userId: @userId
        lastSeen: new Date()
        state: state
        status: 'online'

    return null
