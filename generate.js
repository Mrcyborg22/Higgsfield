// api/generate.js - Vercel Serverless Function
// Uses fal.ai API for Seedance 2.0 video generation
// No auth, no credits, unlimited access

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  try {
    const body = await req.json();
    const {
      prompt,
      image_url,
      duration = 5,
      resolution = '720p',
      aspect_ratio = '16:9',
      motion_intensity = 0.7,
    } = body;

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const FAL_KEY = process.env.FAL_KEY;

    if (!FAL_KEY) {
      return new Response(JSON.stringify({ error: 'FAL_KEY not configured. Add it in Vercel environment variables.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Submit job to fal.ai Seedance 2.0
    const submitPayload = {
      prompt,
      duration,
      resolution,
      aspect_ratio,
      motion_intensity,
    };

    if (image_url) {
      submitPayload.image_url = image_url;
    }

    // Use fal.ai queue for Seedance 2.0
    const endpoint = image_url
      ? 'fal-ai/seedance-1-5/image-to-video' // image to video
      : 'fal-ai/seedance-1-5/text-to-video';  // text to video

    const submitRes = await fetch(`https://queue.fal.run/${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submitPayload),
    });

    if (!submitRes.ok) {
      const err = await submitRes.text();
      return new Response(JSON.stringify({ error: `fal.ai error: ${err}` }), {
        status: submitRes.status,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const submitData = await submitRes.json();
    const requestId = submitData.request_id;

    // Poll for result (max 3 minutes)
    const maxAttempts = 36;
    let attempts = 0;

    while (attempts < maxAttempts) {
      await new Promise(r => setTimeout(r, 5000));
      attempts++;

      const statusRes = await fetch(`https://queue.fal.run/${endpoint}/requests/${requestId}/status`, {
        headers: { 'Authorization': `Key ${FAL_KEY}` },
      });

      const statusData = await statusRes.json();

      if (statusData.status === 'COMPLETED') {
        const resultRes = await fetch(`https://queue.fal.run/${endpoint}/requests/${requestId}`, {
          headers: { 'Authorization': `Key ${FAL_KEY}` },
        });
        const result = await resultRes.json();

        return new Response(JSON.stringify({
          success: true,
          video_url: result.video?.url || result.video_url,
          request_id: requestId,
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      if (statusData.status === 'FAILED') {
        return new Response(JSON.stringify({ error: 'Generation failed', details: statusData }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }
    }

    return new Response(JSON.stringify({ error: 'Timeout: generation took too long' }), {
      status: 408,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}
