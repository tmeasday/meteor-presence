Package.describe({
  summary: "A package to help track users' presence"
});

Package.on_use(function (api) {
  api.use('standard-app-packages');
  api.use('coffeescript');
  api.use('accounts-base');
  // if we have isolate value - go for it
  api.use('isolate-value', 'client', {weak: true});

  api.add_files(['lib/collection.coffee', 'lib/heartbeat.coffee']);
  api.add_files(['lib/client/monitor.coffee', 'lib/client/presence.coffee'], 'client');
  api.add_files(['lib/server/monitor.coffee', 'lib/server/presence.coffee'], 'server');
});
