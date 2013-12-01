Meteor.startup(function() {
  Meteor.presences.remove({});
});

Meteor.publish(null, function() {
  var session = this._session;

  // console.log('sessionId: ' + session.id + ' userId: ' + session.userId);

  Meteor.presences.upsert(session.id, { _id: session.id });

  if (session.userId)
    Meteor.presences.update(session.id, { $set: { userId: session.userId }});

  if (! session.userId && session.sessionData.userId)
    Meteor.presences.update({ userId: session.sessionData.userId }, { $unset: { userId: '' }}, { multi: true });

  session.sessionData.sessionId = session.id;
  session.sessionData.userId = session.userId;

  this._session.socket.on('close', Meteor.bindEnvironment(function() {
    // console.log('socket closed: ' + session.id);
    Meteor.presences.remove(session.id);
  }, function(error) {
    return Meteor._debug('Exception from connection close callback: ', error);
  }));
});

Meteor.methods({
  updatePresence: function(state) {
    var sessionId = this._sessionData.sessionId;
    if (sessionId) {
      // console.log('updatePresence: ' + sessionId);
      Meteor.presences.update(sessionId, { $set: { state: state }});
    }
  }
});
