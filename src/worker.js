// Slugs that have been renamed — old → new (301 redirects)
const AGENT_REDIRECTS = {
  'reginald-sarpong': 'reggie-sarpong',
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (/^\/agent\/[^/]+\/?$/.test(url.pathname)) {
      const slug = url.pathname.replace(/^\/agent\//, '').replace(/\/$/, '');

      // Redirect renamed slugs
      if (AGENT_REDIRECTS[slug]) {
        const dest = new URL('/agent/' + AGENT_REDIRECTS[slug], url);
        return Response.redirect(dest.toString(), 301);
      }

      const templateUrl = new URL('/agent', url);
      return env.ASSETS.fetch(new Request(templateUrl.toString(), request));
    }

    return env.ASSETS.fetch(request);
  },
};
