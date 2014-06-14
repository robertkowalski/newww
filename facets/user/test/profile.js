var Lab = require('lab'),
    describe = Lab.experiment,
    before = Lab.before,
    it = Lab.test,
    expect = Lab.expect;

var Hapi = require('hapi'),
    config = require('../../../config').user,
    user = require('../');

var server, source, u = {};
var users = require('./fixtures/users'),
    fakeBrowse = require('./fixtures/fakeuser-browse');

var username1 = 'fakeuser',
    username2 = 'fakeuserCli';

// prepare the server
before(function (done) {
  var serverOptions = {
    views: {
      engines: {hbs: require('handlebars')},
      partialsPath: '../../hbs-partials',
      helpersPath: '../../hbs-helpers'
    }
  };

  server = Hapi.createServer(serverOptions);

  server.ext('onPreResponse', function (request, next) {
    source = request.response.source;
    if (source.context.profile) {
      var username = source.context.profile.title;
      u[username] = source.context.profile;
    }
    next();
  });

  server.pack.register(require('hapi-auth-cookie'), function (err) {
    if (err) throw err;

    server.app.cache = server.cache('sessions', {
      expiresIn: 30
    });

    server.auth.strategy('session', 'cookie', 'try', {
      password: '12345'
    });

    server.pack.register({
      plugin: user,
      options: config
    }, function (err) {

      // manually start the cache
      server.app.cache._cache.connection.start(done);
    });
  });
});

before(function (done) {
  server.methods = {
    getUserFromCouch: function (username, next) {
      if (typeof users[username] === 'undefined') {
        return next(Hapi.error.notFound(username));
      }

      return next(null, users[username]);
    },

    getBrowseData: function (type, arg, skip, limit, next) {
      return next(null, fakeBrowse[type])
    }
  }

  done();
});

describe('Retreiving profiles from the registry', function () {

  it('gets a website-registered user from the registry', function (done) {
    var options = {
      url: '/~' + username1
    }

    server.inject(options, function (resp) {
      expect(resp.statusCode).to.equal(200);
      done();
    });
  });

  it('gets a cli-registered user from the registry', function (done) {
    var options = {
      url: '/~' + username2
    }

    server.inject(options, function (resp) {
      expect(resp.statusCode).to.equal(200);
      done();
    });
  });

  it('sends the profile to the profile template', function (done) {
    expect(source.template).to.equal('profile');
    done();
  });

  it('renders an error page with a user that doesn\'t exist', function (done) {
    var options = {
      url: '/~blerg'
    }

    server.inject(options, function (resp) {
      expect(source.template).to.equal('profile-not-found');
      done();
    })
  })

});

describe('Modifying the profile before sending it to the template', function () {
  it('sends the transformed profile', function (done) {
    expect(u[username1].showprofile.name).to.equal(username1);
    expect(u[username2].showprofile.name).to.equal(username2);
    done();
  });

  it('separates the fields from the original profile', function (done) {
    expect(u[username1].fields).to.equal(users[username1].fields);
    expect(u[username2].fields).to.equal(users[username2].fields);
    done();
  });

  it('randomly sorts the packages list', function (done) {
    expect(u[username1].packages.sort()).to.deep.equal(fakeBrowse['author'].sort());
    expect(u[username2].packages.sort()).to.deep.equal(fakeBrowse['author'].sort());
    done();
  });

  it('cuts the stars list down to the MAX_COUNT and adds some "more" text', function (done) {
    expect(fakeBrowse['userstar'].length).to.be.gt(20);
    expect(u[username1].starred.length).to.equal(21);
    expect(u[username1].starred[20].name).to.include('more');
    expect(u[username2].starred.length).to.equal(21);
    expect(u[username2].starred[20].name).to.include('more');
    done();
  });

  it('includes avatar links', function (done) {
    expect(u[username1].showprofile.avatar).to.exist;
    expect(u[username1].showprofile.avatar).to.contain('gravatar');
    expect(u[username2].showprofile.avatar).to.exist;
    expect(u[username2].showprofile.avatar).to.contain('gravatar');
    done();
  });

});
