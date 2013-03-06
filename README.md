# Meteor Presence

A very simple presence package, to track who's online, etc.

## Installation

The Presence package can be installed with [Meteorite](https://github.com/oortcloud/meteorite/). From inside a Meteorite-managed app:

``` sh
$ mrt add presence
```

## Usage

By default, the package will, every second, track a _browser window_'s activity. If it hasn't seen activity from a window in 10 seconds, it will assume that window is offline.

The user's online state can be tracked via the `Meteor.presences` collection, referenced by `userId`

NOTE: The package doesn't publish the presences by default, you'll need to do something like
```js
Meteor.publish('userPresence', function() {
  // Setup some filter to find the users your logged in user
  // cares about. It's unlikely that you want to publish the 
  // presences of _all_ the users in the system.
  var filter = {}; 
    
  return Meteor.presences.find(filter);
});
```

To use that presence, you can inspect the `Meteor.presences` collection in the client.

## Advanced Usage

If you want to track more than just what a user is doing (but instead what they are up to), you can set a custom state function. (The default state function return just `'online'`):

```js
Meteor.Presence.state = function() {
  return {
    online: true,
    currentRoomId: Session.get('currentRoomId');
  };
}
```

Of course presence will call your function reactively, so everyone will know as soon as things change.

## Contributing

Please! The biggest thing right now is figuring how to write tests.