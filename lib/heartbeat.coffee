class Heartbeat
  constructor: (@interval)->
    @heartbeat = null
    @action = null
    @started = false

  start: (@action)->
    if @started
      return
    @started = true
    @_enqueue()
    return

  stop: ()->
    @started = false
    @action = null
    @_dequeue()
    return

  tick: ()=>
    @action?()
    return

  tock: ()=>
    unless @started
      return
    @_dequeue()
    @_enqueue()
    return

  _dequeue: ()->
    if @heartbeat?
      Meteor.clearTimeout(@heartbeat)
      @heartbeat = null
    return

  _enqueue: ()->
    @heartbeat = Meteor.setTimeout(@tick, @interval)
    return

@Heartbeat = Heartbeat
