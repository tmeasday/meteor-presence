# Meteor Presence

A very simple presence package, to track who's online, etc.

## Installation

The Presence package can be installed with [Meteorite](https://github.com/oortcloud/meteorite/). From inside a Meteorite-managed app:

``` sh
$ mrt add presence
```

## Usage

By default, the package will track users connected to the Meteor server.

The user's online state can be tracked via the `Meteor.presences` collection, referenced by `userId`

NOTE: The package doesn't publish the presences by default, you'll need to do something like:
```js
Meteor.publish('userPresence', function() {
  // Setup some filter to find the users your logged in user
  // cares about. It's unlikely that you want to publish the
  // presences of _all_ the users in the system.
  var filter = {
    _id: {
      $ne: this.connection.sessionKey // don't publish the current user
    },
    status: 'online' // publish only clients that called 'setPresence'
  };
  // ProTip: unless you need it, don't send lastSeen down as it'll make your
  // templates constantly re-render (and use bandwidth)
  return Meteor.presences.find(filter, {fields: {state: true, userId: true}});
});
```

To use that presence, you can inspect the `Meteor.presences` collection in the client.

## Advanced Usage

### Custom State
If you want to track more than just what a user is doing (but instead what they are up to), you can set a custom state function. (The default state function return just `'online'`):

```js
Meteor.Presence.configure({
  state: function() {
    return {
      online: true,
      currentRoomId: Session.get('currentRoomId');
    }
  }
});
```

Of course presence will call your function reactively, so everyone will know as soon as things change.

### Client Heartbeat

If you want the 'lastSeen' to update at a fixed interval, pass a heartbeat value

```js
Meteor.Presence.configure({
  heartbeat: 60000 // 60s
});
```

### Non-Reactive State

You can disable reactivity on the state function, useful when using a heartbeat only.

```js
Meteor.Presence.configure({
  reactive: false,
  state: myExtremelyVolatileFunction
});
```

### Isolate State

You can ensure that the reactive state function is only called when it's output is changed, by enabling isolate: true (requires isolate-value)

```js
Meteor.Presence.configure({
  isolate: true,
  state: function(){
    if (Session.get('myValue') > 10){
      return 'good';
    } else {
      return 'bad'
    }
  }
});
```

### Clustering / Server Heartbeat

If you have multiple servers - you will notice that starting a new server will clear all presences.

You'll need to enable a server-heartbeat to clear presences from servers that don't respond within a heartbeat / timeout period.

```js
if (Meteor.isServer){
  Meteor.Presence.configure({
    heartbeat: 600000, // 10 minutes
    timeout: 1800000 // 30 minutes
  });
}
```

Note: There's currently no recovery for presence in case of a timeout.

## Contributing

Please! The biggest thing right now is figuring how to write tests.
