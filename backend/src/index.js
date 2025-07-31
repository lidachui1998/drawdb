import { Router } from 'itty-router';
import { v4 as uuidv4 } from 'uuid';
import * as jose from 'jose';

const router = Router();

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Helper function to create responses with CORS headers
const jsonWithCors = (data, status = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
};

const errorWithCors = (status, message) => {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
};

// Middleware to authenticate requests
const authMiddleware = async (request, env) => {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorWithCors(401, 'Unauthorized');
  }

  const token = authHeader.substring(7);
  try {
    const secret = new TextEncoder().encode(env.JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    request.userId = payload.userId; // Attach userId to the request
  } catch (e) {
    return errorWithCors(401, 'Invalid token');
  }
};

// Generate a 6-digit verification code
const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

// Send verification email via Resend
const sendVerificationEmail = async (email, code, env) => {
  console.log('Attempting to send email to:', email, 'with code:', code);

  const emailData = {
    from: 'DrawDB <system@bjca.xyz>',
    to: [email],
    subject: 'DrawDB 验证码',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">DrawDB 验证码</h2>
        <p>您的验证码是：</p>
        <div style="background: #f0f0f0; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0;">
          ${code}
        </div>
        <p>此验证码将在10分钟后过期。</p>
        <p>如果您没有请求此验证码，请忽略此邮件。</p>
      </div>
    `,
  };

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    const responseData = await response.json();
    console.log('Resend API response:', responseData);

    if (!response.ok) {
      console.error('Failed to send email:', responseData);
      throw new Error(`Failed to send verification email: ${responseData.message || 'Unknown error'}`);
    }

    return responseData;
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};

// Handle preflight requests
router.options('*', () => new Response(null, { headers: corsHeaders }));

// Health check endpoint
router.get('/health', () => {
  return jsonWithCors({ status: 'ok', timestamp: new Date().toISOString() });
});

// Request a login code
router.post('/api/auth/login', async (request, env) => {
  try {
    const { email } = await request.json();
    if (!email) {
      return errorWithCors(400, 'Email is required.');
    }

    const code = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    await env.DB.prepare(
      'INSERT OR REPLACE INTO auth_codes (email, code, expires_at) VALUES (?, ?, ?)'
    )
      .bind(email, code, expiresAt.toISOString())
      .run();

    await sendVerificationEmail(email, code, env);

    return jsonWithCors({ success: true, message: 'Verification code sent.' });
  } catch (e) {
    console.error(e);
    return errorWithCors(500, 'Failed to send verification code.');
  }
});

// Verify the code and issue a JWT
router.post('/api/auth/verify', async (request, env) => {
  try {
    const { email, code } = await request.json();
    if (!email || !code) {
      return errorWithCors(400, 'Email and code are required.');
    }

    const { results } = await env.DB.prepare(
      'SELECT * FROM auth_codes WHERE email = ? AND code = ?'
    )
      .bind(email, code)
      .all();

    const authCode = results[0];

    if (!authCode || new Date() > new Date(authCode.expires_at)) {
      return errorWithCors(401, 'Invalid or expired code.');
    }

    // Delete the used code
    await env.DB.prepare('DELETE FROM auth_codes WHERE email = ?').bind(email).run();

    // Find or create user
    let user = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
    let userId = user?.id;

    if (!user) {
      userId = uuidv4();
      await env.DB.prepare('INSERT INTO users (id, email) VALUES (?, ?)')
        .bind(userId, email)
        .run();
    }

    // Issue JWT
    const secret = new TextEncoder().encode(env.JWT_SECRET);
    const token = await new jose.SignJWT({ userId, email })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(secret);

    return jsonWithCors({ token });
  } catch (e) {
    console.error(e);
    return errorWithCors(500, 'Internal server error.');
  }
});

// Get all diagrams for the logged-in user (owned or collaborated on)
router.get('/api/diagrams', async (request, env) => {
  const authResult = await authMiddleware(request, env);
  if (authResult) return authResult;

  try {
    const userId = request.userId;
    const { results } = await env.DB.prepare(
      `SELECT d.* FROM diagrams d
       LEFT JOIN diagram_collaborators dc ON d.id = dc.diagram_id
       WHERE d.owner_id = ? OR dc.user_id = ?`
    )
      .bind(userId, userId)
      .all();

    return jsonWithCors(results);
  } catch (e) {
    console.error(e);
    return errorWithCors(500, 'Internal server error.');
  }
});

// Create a new diagram
router.post('/api/diagrams', async (request, env) => {
  const authResult = await authMiddleware(request, env);
  if (authResult) return authResult;

  try {
    const userId = request.userId;
    const { name, content } = await request.json();
    const diagramId = uuidv4();

    await env.DB.prepare(
      'INSERT INTO diagrams (id, name, content, owner_id) VALUES (?, ?, ?, ?)'
    )
      .bind(diagramId, name || 'Untitled Diagram', JSON.stringify(content), userId)
      .run();

    return jsonWithCors({ id: diagramId });
  } catch (e) {
    console.error(e);
    return errorWithCors(500, 'Internal server error.');
  }
});

// Get a specific diagram
router.get('/api/diagrams/:id', async (request, env) => {
  const authResult = await authMiddleware(request, env);
  if (authResult) return authResult;

  try {
    const userId = request.userId;
    const { id } = request.params;

    const diagram = await env.DB.prepare(
      `SELECT d.* FROM diagrams d
       LEFT JOIN diagram_collaborators dc ON d.id = dc.diagram_id
       WHERE d.id = ? AND (d.owner_id = ? OR dc.user_id = ?)`
    )
      .bind(id, userId, userId)
      .first();

    if (!diagram) {
      return errorWithCors(404, 'Diagram not found or access denied.');
    }

    return jsonWithCors(diagram);
  } catch (e) {
    console.error(e);
    return errorWithCors(500, 'Internal server error.');
  }
});

// Update a diagram
router.put('/api/diagrams/:id', async (request, env) => {
  const authResult = await authMiddleware(request, env);
  if (authResult) return authResult;

  try {
    const userId = request.userId;
    const { id } = request.params;
    const { name, content } = await request.json();

    // First, verify the user has access to this diagram
    const diagram = await env.DB.prepare(
      `SELECT d.id FROM diagrams d
       LEFT JOIN diagram_collaborators dc ON d.id = dc.diagram_id
       WHERE d.id = ? AND (d.owner_id = ? OR dc.user_id = ?)`
    )
      .bind(id, userId, userId)
      .first();

    if (!diagram) {
      return errorWithCors(404, 'Diagram not found or access denied.');
    }

    // Update the diagram
    await env.DB.prepare(
      'UPDATE diagrams SET name = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    )
      .bind(name, JSON.stringify(content), id)
      .run();

    return jsonWithCors({ success: true });
  } catch (e) {
    console.error(e);
    return errorWithCors(500, 'Internal server error.');
  }
});

// Share a diagram with another user
router.post('/api/diagrams/:id/share', async (request, env) => {
  const authResult = await authMiddleware(request, env);
  if (authResult) return authResult;

  try {
    const ownerId = request.userId;
    const { id: diagramId } = request.params;
    const { email: collaboratorEmail } = await request.json();

    // Verify ownership
    const diagram = await env.DB.prepare('SELECT id FROM diagrams WHERE id = ? AND owner_id = ?')
      .bind(diagramId, ownerId)
      .first();

    if (!diagram) {
      return errorWithCors(403, 'Only the owner can share this diagram.');
    }

    // Find the user to share with
    const collaborator = await env.DB.prepare('SELECT id FROM users WHERE email = ?')
      .bind(collaboratorEmail)
      .first();

    if (!collaborator) {
      return errorWithCors(404, 'Collaborator user not found.');
    }

    // Add collaborator
    await env.DB.prepare(
      'INSERT OR IGNORE INTO diagram_collaborators (diagram_id, user_id) VALUES (?, ?)'
    )
      .bind(diagramId, collaborator.id)
      .run();

    return jsonWithCors({ success: true, message: 'Diagram shared successfully.' });
  } catch (e) {
    console.error(e);
    return errorWithCors(500, 'Internal server error.');
  }
});

// Delete a diagram
router.delete('/api/diagrams/:id', async (request, env) => {
  const authResult = await authMiddleware(request, env);
  if (authResult) return authResult;

  try {
    const userId = request.userId;
    const { id } = request.params;

    // Only the owner can delete a diagram
    const diagram = await env.DB.prepare('SELECT id FROM diagrams WHERE id = ? AND owner_id = ?')
      .bind(id, userId)
      .first();

    if (!diagram) {
      return errorWithCors(403, 'Only the owner can delete this diagram.');
    }

    // Delete collaborators first
    await env.DB.prepare('DELETE FROM diagram_collaborators WHERE diagram_id = ?').bind(id).run();

    // Delete the diagram
    await env.DB.prepare('DELETE FROM diagrams WHERE id = ?').bind(id).run();

    return jsonWithCors({ success: true });
  } catch (e) {
    console.error(e);
    return errorWithCors(500, 'Internal server error.');
  }
});

// Catch-all for 404s
router.all('*', () => errorWithCors(404, 'Not Found'));

export default {
  async fetch(request, env, ctx) {
    try {
      return await router.handle(request, env, ctx);
    } catch (error) {
      console.error('Unhandled error:', error);
      return errorWithCors(500, 'Internal server error');
    }
  },
};