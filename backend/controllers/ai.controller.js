const OpenAI = require('openai');

const hasOpenAiKey = Boolean(
  process.env.OPENAI_API_KEY &&
  process.env.OPENAI_API_KEY !== 'sk-your-api-key-here'
);

const openai = hasOpenAiKey ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

const callAI = async (systemPrompt, userPrompt) => {
  if (!openai) {
    return null;
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 500,
  });

  return response.choices[0].message.content.trim();
};

exports.generateSummary = async (req, res) => {
  const { name, title, skills, experience, education } = req.body;

  try {
    if (!hasOpenAiKey) {
      return res.json({
        summary: `Generated summary: Mehnati and motivated ${title || 'professional'} with strengths in ${Array.isArray(skills) && skills.length ? skills.join(', ') : 'communication, teamwork, and problem solving'}.`,
      });
    }

    const result = await callAI(
      'You are a professional resume writer. Write concise, impactful professional summaries in 3-4 sentences. Focus on value delivered, not duties.',
      `Generate a professional summary for:
Name: ${name}
Target Role: ${title}
Skills: ${skills?.join(', ')}
Experience: ${experience}
Education: ${education}
Write only the summary paragraph, no labels.`
    );

    return res.json({ summary: result });
  } catch (error) {
    console.error('AI summary error:', error.message);
    return res.status(500).json({ error: 'Failed to generate summary.' });
  }
};

exports.improveDescription = async (req, res) => {
  const { description, position, company } = req.body;

  try {
    if (!hasOpenAiKey) {
      return res.json({
        improved: `Led key responsibilities as ${position || 'team member'} at ${company || 'the organization'}, strengthened execution quality, and delivered measurable outcomes through ownership and collaboration.`,
      });
    }

    const result = await callAI(
      'You are an expert resume writer. Rewrite job descriptions using strong action verbs, quantifiable achievements, and industry keywords. Use bullet points. Keep it concise.',
      `Improve this job description for ${position} at ${company}:
"${description}"
Return only the improved bullet points.`
    );

    return res.json({ improved: result });
  } catch (error) {
    console.error('AI improve error:', error.message);
    return res.status(500).json({ error: 'Failed to improve description.' });
  }
};

exports.suggestSkills = async (req, res) => {
  const { role, existingSkills } = req.body;

  try {
    if (!hasOpenAiKey) {
      return res.json({
        skills: ['Communication', 'Problem Solving', 'Leadership', 'Time Management', 'Teamwork'].filter(
          (skill) => !(existingSkills || []).includes(skill)
        ),
      });
    }

    const result = await callAI(
      'You are a career coach and tech recruiter. Suggest relevant technical and soft skills. Return a JSON array of strings only with no explanation or markdown.',
      `Suggest 10 relevant skills for a ${role}.
Existing skills to avoid repeating: ${existingSkills?.join(', ')}.
Return ONLY a JSON array like: ["skill1", "skill2", ...]`
    );

    const cleaned = result.replace(/```json|```/g, '').trim();
    const skills = JSON.parse(cleaned);
    return res.json({ skills });
  } catch (error) {
    console.error('AI skills error:', error.message);
    return res.status(500).json({ error: 'Failed to suggest skills.' });
  }
};
