var Lab = require('lab'),
    lab = exports.lab = Lab.script(),
    describe = lab.describe,
    before = lab.before,
    it = lab.it,
    expect = Lab.expect;

var server, serverResponse, source, ctx;

before(function (done) {
  server = require('./fixtures/setupServer')(done);

  server.ext('onPreResponse', function (request, next) {
    source = request.response.source;
    ctx = source.context;
    next();
  });
});

describe('Getting to the npme beta page', function () {
  it('gets there, no problem', function (done) {
    var opts = {
      url: '/npme-beta'
    };

    server.inject(opts, function (resp) {
      expect(resp.statusCode).to.equal(200);
      expect(source.template).to.equal('npme-beta');
      done();
    });
  });

  it('has all the pieces', function (done) {
    expect(ctx.title).to.equal('npm Enterprise beta');
    expect(ctx.hiring).to.exist;
    done();
  });
});

describe('Getting to the npme beta thanks page', function () {
  it('gets there, no problem', function (done) {
    var opts = {
      url: '/npme-beta-thanks'
    };

    server.inject(opts, function (resp) {
      expect(resp.statusCode).to.equal(200);
      expect(source.template).to.equal('npme-beta-thanks');
      done();
    });
  });

  it('has all the pieces', function (done) {
    expect(ctx.title).to.equal('npm Enterprise beta');
    expect(ctx.hiring).to.exist;
    done();
  });
});
