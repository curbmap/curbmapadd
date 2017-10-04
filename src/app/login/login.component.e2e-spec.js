describe('Home', function () {

  beforeEach(function () {
    browser.get('/');
  });

  it('should have <my-login>', function () {
    var home = element(by.css('my-app my-login'));
    expect(home.isPresent()).toEqual(true);
    expect(home.getText()).toEqual("Home Works!");
  });

});
