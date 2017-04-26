describe('Service: theLinkWebService', function () {

  beforeEach(module('theLinkWebService'));

  var thisService, httpBackend, rootScope;

  beforeEach(inject(function ($httpBackend, $rootScope, _WebService_) {
    rootScope = $rootScope;
    thisService = _WebService_;
    httpBackend = $httpBackend;
  }));

  afterEach(function () {
    httpBackend.verifyNoOutstandingExpectation();
    httpBackend.verifyNoOutstandingRequest();
  });

  describe('Method: basicGet', function () {
    it('Makes a successful GET request without params', function () {
      httpBackend.expectGET(thisService.baseUrl + '/api/test').respond(200, 'test');

      var response;

      thisService.basicGet('/api/test').then(function (result) {
        response = result;
      });
      httpBackend.flush();

      //This resolves the HTTP promises.
      rootScope.$apply();

      expect(response.status).toEqual(200);
      expect(response.data).toEqual('test');
    });

    it('Makes a successful GET request with params', function () {
      httpBackend.expectGET(thisService.baseUrl + '/api/test?key=val').respond(200, 'succ');

      var response;

      thisService.basicGet('/api/test', {
        key: 'val'
      }).then(function (result) {
        response = result;
      });
      httpBackend.flush();

      //This resolves the HTTP promises.
      rootScope.$apply();

      expect(response.status).toEqual(200);
      expect(response.data).toEqual('succ');
    });

    it('Makes an unsuccessful get request', function () {
      httpBackend.expectGET(thisService.baseUrl + '/api/test').respond(400, 'fail');

      var response;

      thisService.basicGet('/api/test').then(function (result) {
        response = result;
      });
      httpBackend.flush();

      //This resolves the HTTP promises.
      rootScope.$apply();

      expect(response.status).toEqual(400);
      expect(response.data).toEqual('fail');
    });

  });

  describe('Method: serializeData', function () {
    it('Serializes Data for HTTP POST', function () {
      expect(thisService.serializeData({
          username: 'test',
          password: 'test2'
        }))
        .toEqual('username=test&password=test2');
    });

    it('Does not serialize garbage data.', function () {
      expect(thisService.serializeData([]))
        .toEqual('');
    });
  });

});