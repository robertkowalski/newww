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

describe('Getting to the home page', function () {
  it('gets there, no problem', function (done) {
    var opts = {
      url: '/about'
    };

    server.inject(opts, function (resp) {
      expect(resp.statusCode).to.equal(200);
      expect(source.template).to.equal('about');
      done();
    });
  });

  it('has all the pieces', function (done) {
    expect(ctx.title).to.equal('About');
    expect(ctx.hiring).to.exist;
    expect(ctx.package.name).to.equal('newww');
    expect(ctx.dependencies).to.be.an('Array');
    expect(ctx.contributors).to.be.an('Array');
    done();
  });
});
