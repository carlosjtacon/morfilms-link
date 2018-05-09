import { MorfilmsSharingPage } from './app.po';

describe('morfilms-sharing App', () => {
  let page: MorfilmsSharingPage;

  beforeEach(() => {
    page = new MorfilmsSharingPage();
  });

  it('should display welcome message', done => {
    page.navigateTo();
    page.getParagraphText()
      .then(msg => expect(msg).toEqual('Welcome to app!!'))
      .then(done, done.fail);
  });
});
