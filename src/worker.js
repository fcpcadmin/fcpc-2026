// Slugs that have been renamed — old → new (301 redirects)
const AGENT_REDIRECTS = {
  'reginald-sarpong': 'reggie-sarpong',
};

// ── Zoho helpers ─────────────────────────────────────────────────────────────

async function getZohoToken(env) {
  const res = await fetch('https://accounts.zoho.com/oauth/v2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type:    'refresh_token',
      client_id:     env.ZOHO_CLIENT_ID,
      client_secret: env.ZOHO_CLIENT_SECRET,
      refresh_token: env.ZOHO_REFRESH_TOKEN,
    }),
  });
  if (!res.ok) throw new Error('Token refresh failed: ' + res.status);
  const data = await res.json();
  if (!data.access_token) throw new Error('No access_token in response');
  return data.access_token;
}

async function createZohoRecord(module, fields, token) {
  const res = await fetch('https://www.zohoapis.com/crm/v2/' + module, {
    method: 'POST',
    headers: {
      'Authorization': 'Zoho-oauthtoken ' + token,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({ data: [fields] }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error('Zoho ' + module + ' create failed ' + res.status + ': ' + text);
  }
  return res.json();
}

// ── CORS / JSON helpers ───────────────────────────────────────────────────────

function jsonOk(body) {
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}

function jsonErr(msg, status) {
  return new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}

// ── US states for validation ──────────────────────────────────────────────────

const US_STATES = new Set([
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC',
]);

const ALLOWED_PRODUCTS  = new Set(['Life Insurance','Indexed Annuities','Final Expense','Supplemental Health','Not sure yet']);
const CONTACT_METHODS   = new Set(['Phone call','Text','Email']);
const BEST_TIMES        = new Set(['Morning','Afternoon','Evening','Any time']);
const LICENSED_OPTS     = new Set(['Yes','No','In progress']);

// ── POST /api/lead ────────────────────────────────────────────────────────────

async function handleLead(request, env) {
  let body;
  try { body = await request.json(); } catch { return jsonErr('Invalid JSON', 400); }

  // Honeypot
  if (body.website) return jsonOk({ ok: true }); // silently accept

  // Timing bot check (< 3 s)
  if (typeof body._t === 'number' && Date.now() - body._t < 3000) {
    return jsonOk({ ok: true });
  }

  const { firstName, lastName, email, phone, state, products, preferredContact, bestTime, message, agentCode } = body;

  // Required fields
  if (!firstName || !lastName || !email || !phone || !state) return jsonErr('Missing required fields', 400);
  if (!US_STATES.has(state)) return jsonErr('Invalid state', 400);
  if (!Array.isArray(products) || products.length === 0) return jsonErr('Select at least one product', 400);
  if (products.some(p => !ALLOWED_PRODUCTS.has(p))) return jsonErr('Invalid product', 400);
  if (!CONTACT_METHODS.has(preferredContact)) return jsonErr('Invalid contact method', 400);
  if (!BEST_TIMES.has(bestTime)) return jsonErr('Invalid best time', 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return jsonErr('Invalid email', 400);

  const token = await getZohoToken(env);
  await createZohoRecord('Leads', {
    First_Name:          firstName.trim(),
    Last_Name:           lastName.trim(),
    Email:               email.trim().toLowerCase(),
    Phone:               phone.trim(),
    State:               state,
    Lead_Source:         'Agent Mini-Site',
    Description:         message ? message.trim() : '',
    // custom fields — adjust API names to match your Zoho layout
    Products_Interest:   products.join('; '),
    Preferred_Contact:   preferredContact,
    Best_Time_to_Reach:  bestTime,
    Agent_Code:          agentCode || '',
    FCPC_Consent:        true,
  }, token);

  return jsonOk({ ok: true });
}

// ── POST /api/recruit ─────────────────────────────────────────────────────────

async function handleRecruit(request, env) {
  let body;
  try { body = await request.json(); } catch { return jsonErr('Invalid JSON', 400); }

  if (body.website) return jsonOk({ ok: true });

  if (typeof body._t === 'number' && Date.now() - body._t < 3000) {
    return jsonOk({ ok: true });
  }

  const { firstName, lastName, email, phone, state, licensed, occupation, interest, agentCode } = body;

  if (!firstName || !lastName || !email || !phone || !state || !occupation) return jsonErr('Missing required fields', 400);
  if (!US_STATES.has(state)) return jsonErr('Invalid state', 400);
  if (!LICENSED_OPTS.has(licensed)) return jsonErr('Invalid licensed value', 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return jsonErr('Invalid email', 400);

  const token = await getZohoToken(env);
  await createZohoRecord('Leads', {
    First_Name:          firstName.trim(),
    Last_Name:           lastName.trim(),
    Email:               email.trim().toLowerCase(),
    Phone:               phone.trim(),
    State:               state,
    Lead_Source:         'Agent Recruit Form',
    Description:         interest ? interest.trim() : '',
    Currently_Licensed:  licensed,
    Current_Occupation:  occupation.trim(),
    Agent_Code:          agentCode || '',
    FCPC_Consent:        true,
  }, token);

  return jsonOk({ ok: true });
}

// ── Main fetch handler ────────────────────────────────────────────────────────

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === 'OPTIONS' && url.pathname.startsWith('/api/')) {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin':  '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // API routes
    if (url.pathname === '/api/lead' && request.method === 'POST') {
      try { return await handleLead(request, env); }
      catch (e) { return jsonErr('Internal error', 500); }
    }
    if (url.pathname === '/api/recruit' && request.method === 'POST') {
      try { return await handleRecruit(request, env); }
      catch (e) { return jsonErr('Internal error', 500); }
    }

    // Agent mini-site routing
    if (/^\/agent\/[^/]+\/?$/.test(url.pathname)) {
      const slug = url.pathname.replace(/^\/agent\//, '').replace(/\/$/, '');

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
