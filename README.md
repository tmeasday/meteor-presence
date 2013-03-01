# Meteor Presence

A very simple presence package, to track who's online, etc.

## Installation

The Presence package can be installed with [Meteorite](https://github.com/oortcloud/meteorite/). From inside a Meteorite-managed app:

``` sh
$ mrt add presence
```

## Usage

By default, the package will, every second, track that a user is online. If it hasn't seen a user online within the last 10 seconds, it assumes they are offline.

The user's online state can be tracked via `user.presence.state`, which is set to `'online'` if they are online. 

NOTE: The package doesn't publish the presence field of any users, you'll need to do something like
```js
Meteor.publish('userPresence', function() {
  // Setup some filter to find the users your logged in user
  // cares about. It's unlikely that you want to publish the 
  // presences of _all_ the users in the system.
  var filter = {}; 
    
  return Meteor.users.find(filter, fields: {'presence.state': true});
});
```

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