var Lab = require('lab'),
    lab = exports.lab = Lab.script(),
    describe = lab.describe,
    before = lab.before,
    it = lab.it,
    expect = Lab.expect;

var server, serverResponse, source;

before(function (done) {
  server = require('./fixtures/setupServer')(done);

  server.ext('onPreResponse', function (request, next) {
    source = request.response.source;
    next();
  });
});

describe('Accessing fallback URLs', function () {
  it('goes to package page for packages that exist', function (done) {
    var opts = {
      url: '/fake'
    };

    server.inject(opts, function (resp) {
      expect(resp.statusCode).to.equal(302);
      expect(resp.headers.location).to.include('/package/fake');
      done();
    });
  });

  it('goes to 404 wombat page for anything else', function (done) {
    var opts = {
      url: '/blajklasji'
    };

    server.inject(opts, function (resp) {
      expect(resp.statusCode).to.equal(404);
      expect(source.template).to.equal('notfound');
      done();
    });
  });
});
