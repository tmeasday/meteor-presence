

class ClientMonitor

  constructor: ()->
    @started = false
    @computation = null
    @heartbeat = null
    @options =
      state: 'online'
      reactive: true
      isolate: false
      heartbeat: null


  configure: (options)->
    wasStarted = @started
    if @started
      @stop()

    _.extend(@options, options)

    if @options.isolate and not isolateValue?
      throw new Error('Presence - cannot use isolate: true without "isolate-value" package.')

    if @options.heartbeat?
      @heartbeat = new Heartbeat(@options.heartbeat)
    else
      @heartbeat = null

    if wasStarted
      @start()
    return

  start: ()->
    if @started
      return
    @started = true
    @computation = Deps.autorun(@setPresence)
    @heartbeat?.start(@pulse)
    return

  pulse: ()=>
    if @computation == null or @computation.invalidated
      return
    @computation.invalidate()
    return

  stop: ()->
    @started = false
    @heartbeat?.stop()
    @computation?.stop()
    @computation = null
    return

  setPresence: ()=>
    if Meteor.status().connected
      state = @readState()
      Meteor.apply('setPresence', [state], {wait: false}, @setPresenceComplete)
    return

  readState: ()->
    unless _.isFunction(@options.state)
      return @options.state

    unless @options.reactive
      return Deps.nonreactive(@options.state)

    if @options.isolate
      return isolateValue(@options.state)

    return @options.state()

  setPresenceComplete: (err)=>
    if err?
      console.error("Error from Meteor_Presence_setPresence", err)
      return
    @heartbeat?.tock()
    return

@ClientMonitor = ClientMonitor
