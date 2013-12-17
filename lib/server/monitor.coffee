class ServerMonitor
  constructor: ()->
    @serverId = Random.id()
    @options =
      heartbeat: false
      timeout: false
    @heartbeat = null
    @started = false
    Meteor.startup(@onStartup)

  configure: (options)->
    if @started
      throw new Error("Must configure Meteor.Presence on the server before Meteor.startup()")
    _.extend(@options, options)

    if @options.heartbeat == false
      @heartbeat = null
    else
      if !@options.timeout
        @options.timeout = @options.heartbeat * 5
      @heartbeat = new Heartbeat(@options.heartbeat)
    return

  generateSessionKey: ()-> "#{@serverId}-#{Random.id()}"

  onStartup: ()=>
    @started = true
    unless @heartbeat?
      # when not using server heartbeat - just clear presences on startup
      Meteor.presences.remove({})
    else
      @serverHeartbeats = new Meteor.Collection('presence.servers')

      @serverHeartbeats.insert
        _id: @serverId
        lastSeen: new Date()

      @heartbeat.start(@pulse)
    return

  pulse: ()=>
    verify = @serverHeartbeats.upsert
      _id: @serverId
    ,
      $set:
        lastSeen: new Date()

    #XX If this server timed out - we need to re-compute the sessionKeys for each connection
    if verify.insertedId?
      console.warn("Presence: Server Timeout - Presence lost for current connections")

    @serverHeartbeats.remove(lastSeen: $lt: new Date(new Date().getTime() - @options.timeout))
    serverIds = _.pluck(@serverHeartbeats.find({}).fetch(), "_id")
    Meteor.presences.remove
      serverId:
        $nin: serverIds

    @heartbeat.tock()
    return

@ServerMonitor = ServerMonitor
