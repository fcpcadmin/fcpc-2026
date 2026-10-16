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
  const json = await res.json().catch(() => null);
  return { httpStatus: res.status, json };
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

// ── State abbr → full name ────────────────────────────────────────────────────

const STATE_NAMES = {
  AL:'Alabama', AK:'Alaska', AZ:'Arizona', AR:'Arkansas', CA:'California',
  CO:'Colorado', CT:'Connecticut', DE:'Delaware', DC:'District of Columbia',
  FL:'Florida', GA:'Georgia', HI:'Hawaii', ID:'Idaho', IL:'Illinois',
  IN:'Indiana', IA:'Iowa', KS:'Kansas', KY:'Kentucky', LA:'Louisiana',
  ME:'Maine', MD:'Maryland', MA:'Massachusetts', MI:'Michigan', MN:'Minnesota',
  MS:'Mississippi', MO:'Missouri', MT:'Montana', NE:'Nebraska', NV:'Nevada',
  NH:'New Hampshire', NJ:'New Jersey', NM:'New Mexico', NY:'New York',
  NC:'North Carolina', ND:'North Dakota', OH:'Ohio', OK:'Oklahoma', OR:'Oregon',
  PA:'Pennsylvania', RI:'Rhode Island', SC:'South Carolina', SD:'South Dakota',
  TN:'Tennessee', TX:'Texas', UT:'Utah', VT:'Vermont', VA:'Virginia',
  WA:'Washington', WV:'West Virginia', WI:'Wisconsin', WY:'Wyoming',
};

const US_STATES = new Set(Object.keys(STATE_NAMES));

// ── Consent timestamp: yyyy-MM-ddTHH:mm:ss+00:00 ─────────────────────────────

function zohoDatetime() {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  return d.getUTCFullYear() + '-' +
    pad(d.getUTCMonth() + 1) + '-' +
    pad(d.getUTCDate()) + 'T' +
    pad(d.getUTCHours()) + ':' +
    pad(d.getUTCMinutes()) + ':' +
    pad(d.getUTCSeconds()) + '+00:00';
}

// ── Validation sets ───────────────────────────────────────────────────────────

const ALLOWED_PRODUCTS    = new Set(['Life Insurance','Indexed Annuities','Final Expense','Supplemental Health','Not sure yet']);
const CONTACT_METHODS     = new Set(['Phone call','Text','Email']);
const BEST_TIMES          = new Set(['Morning','Afternoon','Evening','Any time']);
const LICENSED_MAP        = { 'Yes': 'Yes', 'No': 'No', 'In progress': 'In Progress' };
const ALLOWED_LEAD_SOURCES    = new Set(['Agent Mini-Site','Contact Page','Life Insurance Calculator']);
const ALLOWED_RECRUIT_SOURCES = new Set(['Agent Mini-Site','Contact Page']);

const CONSENT_TEXT = 'By submitting this form you consent to being contacted by FCPC or its representatives by phone, email, or SMS. Message and data rates may apply. Reply STOP to opt out of text messages.';

// ── Success check ─────────────────────────────────────────────────────────────

function zohoSuccess(zoho, httpStatus) {
  const row = zoho && zoho.data && zoho.data[0];
  if (!row || row.status !== 'success') {
    const details = row && row.details ? row.details : {};
    console.error('Zoho error', row && row.code, row && row.message, JSON.stringify(details));
    return { ok: false, code: (row && row.code) || httpStatus };
  }
  return { ok: true };
}

// ── POST /api/lead ────────────────────────────────────────────────────────────

async function handleLead(request, env) {
  let body;
  try { body = await request.json(); } catch { return jsonErr('Invalid JSON', 400); }

  if (body.website) return jsonOk({ ok: true });
  if (typeof body._t === 'number' && Date.now() - body._t < 3000) return jsonOk({ ok: true });

  const { firstName, lastName, email, phone, state, products, preferredContact, bestTime, message,
          description, calculatorResults, agentCode, source, sourcePage: clientSourcePage, consentTs } = body;

  // source defaults to "Agent Mini-Site" for backwards compat
  const leadSource = source || 'Agent Mini-Site';
  if (!ALLOWED_LEAD_SOURCES.has(leadSource)) return jsonErr('Invalid source', 400);

  const fromMiniSite = leadSource === 'Agent Mini-Site';

  if (!firstName || !lastName || !email) return jsonErr('Missing required fields', 400);
  if (fromMiniSite && !phone) return jsonErr('Missing required fields', 400);
  if (fromMiniSite && !state) return jsonErr('Missing required fields', 400);
  if (fromMiniSite && !US_STATES.has(state)) return jsonErr('Invalid state', 400);
  if (fromMiniSite) {
    if (!Array.isArray(products) || products.length === 0) return jsonErr('Select at least one product', 400);
    if (products.some(p => !ALLOWED_PRODUCTS.has(p))) return jsonErr('Invalid product', 400);
    if (!CONTACT_METHODS.has(preferredContact)) return jsonErr('Invalid contact method', 400);
    if (!BEST_TIMES.has(bestTime)) return jsonErr('Invalid best time', 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return jsonErr('Invalid email', 400);

  const resolvedSourcePage = clientSourcePage || (new URL(request.url).origin + '/agent/' + (agentCode || ''));
  const resolvedConsentTs  = consentTs || zohoDatetime();

  const fields = {
    First_Name:           firstName.trim(),
    Last_Name:            lastName.trim(),
    Email:                email.trim().toLowerCase(),
    Lead_Source:          leadSource,
    Description:          description !== undefined ? description : (message ? message.trim() : ''),
    Agent_Code_Submitted: agentCode || '',
    Source_Page:          resolvedSourcePage,
    Consent_Given:        true,
    Consent_Timestamp:    resolvedConsentTs,
    Consent_Text:         CONSENT_TEXT,
  };
  if (phone) fields.Mobile = phone.trim();
  if (state && US_STATES.has(state)) fields.State = STATE_NAMES[state];
  if (Array.isArray(products) && products.length) fields.Products_of_Interest = products;
  if (preferredContact) fields.Preferred_Contact = preferredContact;
  if (bestTime) fields.Best_Time_To_Reach = bestTime;
  if (calculatorResults) fields.Calculator_Results = String(calculatorResults).slice(0, 2000);

  const token = await getZohoToken(env);
  const { httpStatus, json: zoho } = await createZohoRecord('Leads', fields, token);

  const result = zohoSuccess(zoho, httpStatus);
  if (!result.ok) return jsonErr('Zoho error: ' + result.code, 502);
  return jsonOk({ ok: true });
}

// ── POST /api/recruit ─────────────────────────────────────────────────────────

async function handleRecruit(request, env) {
  let body;
  try { body = await request.json(); } catch { return jsonErr('Invalid JSON', 400); }

  if (body.website) return jsonOk({ ok: true });
  if (typeof body._t === 'number' && Date.now() - body._t < 3000) return jsonOk({ ok: true });

  const { firstName, lastName, email, phone, state, licensed, occupation, interest,
          agentCode, source, sourcePage: clientSourcePage, consentTs } = body;

  const recruitSource = source || 'Agent Mini-Site';
  if (!ALLOWED_RECRUIT_SOURCES.has(recruitSource)) return jsonErr('Invalid source', 400);

  const fromMiniSite = recruitSource === 'Agent Mini-Site';

  if (!firstName || !lastName || !email) return jsonErr('Missing required fields', 400);
  if (fromMiniSite && (!phone || !state || !occupation)) return jsonErr('Missing required fields', 400);
  if (fromMiniSite && !US_STATES.has(state)) return jsonErr('Invalid state', 400);
  if (fromMiniSite && !LICENSED_MAP[licensed]) return jsonErr('Invalid licensed value', 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return jsonErr('Invalid email', 400);

  const resolvedSourcePage = clientSourcePage || (new URL(request.url).origin + '/agent/' + (agentCode || ''));
  const resolvedConsentTs  = consentTs || zohoDatetime();

  const fields = {
    Name:                 firstName.trim() + ' ' + lastName.trim(),
    First_Name:           firstName.trim(),
    Last_Name:            lastName.trim(),
    Email:                email.trim().toLowerCase(),
    Interest_Note:        interest ? interest.trim() : '',
    Recruit_Source:       recruitSource,
    Agent_Code_Submitted: agentCode || '',
    Source_Page:          resolvedSourcePage,
    Consent_Given:        true,
    Consent_Timestamp:    resolvedConsentTs,
    Consent_Text:         CONSENT_TEXT,
  };
  if (phone) fields.Phone = phone.trim();
  if (state && US_STATES.has(state)) fields.State = STATE_NAMES[state];
  if (licensed && LICENSED_MAP[licensed]) fields.Licensed_Status = LICENSED_MAP[licensed];
  if (occupation) fields.Current_Occupation = occupation.trim();

  const token = await getZohoToken(env);
  const { httpStatus, json: zoho } = await createZohoRecord('Recruits', fields, token);

  const result = zohoSuccess(zoho, httpStatus);
  if (!result.ok) return jsonErr('Zoho error: ' + result.code, 502);
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
