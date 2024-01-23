describe('content script', () => {
  it('correctly identifies meta tags', () => {
    // JSDOM setup
    const dom = new JSDOM(`
      <html>
      <head>
        <meta name="author" content="John Doe">
        <meta property="og:title" content="Example Title">
        <title>Alternate Title</title>
      </head>
      <body></body>
      </html>
    `, { url: FIXED_URL });

    global.window = dom.window;
    global.document = dom.window.document;

    const metaAuthorContent = document.querySelector('meta[name="author"]')?.content;
    const metaTitleContent = document.querySelector('meta[property="og:title"]')?.content;

    expect(metaAuthorContent).toBe('John Doe');
    expect(metaTitleContent).toBe('Example Title');
  });
});

