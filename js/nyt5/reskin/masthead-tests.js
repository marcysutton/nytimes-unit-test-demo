/* Global jasmine, $ */

describe('Masthead', function() {

  beforeEach(function() {
    var f = jasmine.getFixtures();
        f.fixturesPath = '/base/js/nyt5/reskin';
        loadFixtures('search-widget.html')
  });

  afterEach(function() {
    var f = jasmine.getFixtures();
        f.cleanUp();
        f.clearCache();
  });

  describe('Sections menu', function(){
    it('Should accesible menu button', function() {
      buildMastheadContent();

      var sectionsBtn = $('#masthead-sections-button');
      expect(sectionsBtn[0].tagName).toBe('BUTTON');
    })
  });

  describe('Search widget', function(){
    it('Should accesible menu button', function() {
      buildMastheadContent();

      var sectionsBtn = $('#masthead-search-button');
      expect(sectionsBtn[0].tagName).toBe('BUTTON');
    });

    it('Should close with the escape key', function(){
      var searchWidget = $('#searchWidget');
      var searchBtn = $('#masthead-search-button');

      searchBtn.trigger('click');

      expect(searchWidget.css('display')).toBe('block');

      searchWidget.trigger('keydown', {keyCode: 27});

      setTimeout(function() {
        expect(searchWidget.css('display')).toBe('none');
      });
    })
  });
});


