import React from 'react';

const safe = (value) => value || '';
const clip = (value, max = 300) => {
  const text = safe(value);
  return text.length > max ? `${text.slice(0, max - 1)}...` : text;
};

const lines = (value) => clip(value, 500).split('\n').map((line, index) => <span key={index}>{line}<br /></span>);

const shellStyle = {
  background: '#fff',
  color: '#1f2937',
  minHeight: '297mm',
  overflowWrap: 'anywhere',
  wordBreak: 'break-word',
};

function Section({ title, children }) {
  return (
    <section style={{ marginBottom: '8mm' }}>
      <h2 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#4361ee', borderBottom: '1px solid #d1d5db', paddingBottom: '4px', marginBottom: '8px' }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

function ModernTemplate({ resume }) {
  const personal = resume.personalInfo || {};

  return (
    <div style={{ ...shellStyle, fontFamily: 'Georgia, serif', padding: '10mm 12mm' }}>
      <header style={{ borderBottom: '3px solid #4361ee', paddingBottom: '6mm', marginBottom: '6mm' }}>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 700 }}>{safe(personal.fullName)}</h1>
        <div style={{ marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '12px', color: '#4b5563' }}>
          {[personal.email, personal.phone, personal.location, personal.linkedin, personal.github, personal.website].filter(Boolean).map((item) => (
            <span key={item}>{clip(item, 60)}</span>
          ))}
        </div>
      </header>

      {personal.summary ? <Section title="Summary"><p style={{ fontSize: '13px', lineHeight: 1.6 }}>{clip(personal.summary, 300)}</p></Section> : null}

      {(resume.experience || []).length > 0 ? (
        <Section title="Experience">
          {resume.experience.map((item, index) => (
            <div key={index} style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                <strong style={{ fontSize: '14px' }}>{safe(item.position)}</strong>
                <span style={{ fontSize: '11px', color: '#6b7280', textAlign: 'right' }}>{safe(item.startDate)} - {item.current ? 'Present' : safe(item.endDate)}</span>
              </div>
              <div style={{ marginBottom: '4px', fontSize: '12px', color: '#4361ee' }}>{clip(`${safe(item.company)} ${item.location ? `- ${item.location}` : ''}`, 120)}</div>
              <div style={{ fontSize: '12px', lineHeight: 1.5 }}>{lines(item.description)}</div>
            </div>
          ))}
        </Section>
      ) : null}

      {(resume.education || []).length > 0 ? (
        <Section title="Education">
          {resume.education.map((item, index) => (
            <div key={index} style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                <strong style={{ fontSize: '13px' }}>{clip(`${safe(item.degree)}${item.field ? ` in ${item.field}` : ''}`, 120)}</strong>
                <span style={{ fontSize: '11px', color: '#6b7280' }}>{safe(item.startYear || item.startDate)} - {safe(item.endYear || item.endDate)}</span>
              </div>
              <div style={{ fontSize: '12px', color: '#4361ee' }}>{clip(`${safe(item.school || item.institution)}${item.gpa ? ` - GPA: ${item.gpa}` : ''}`, 120)}</div>
            </div>
          ))}
        </Section>
      ) : null}

      {(resume.skills || []).length > 0 ? (
        <Section title="Skills">
          <div style={{ fontSize: '12px' }}>{(resume.skills || []).map((skill) => clip(skill, 40)).join(' - ')}</div>
        </Section>
      ) : null}

      {(resume.projects || []).length > 0 ? (
        <Section title="Projects">
          {resume.projects.map((item, index) => (
            <div key={index} style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                <strong style={{ fontSize: '13px' }}>{clip(item.title || item.name, 100)}</strong>
                {item.link ? <span style={{ fontSize: '11px', color: '#4361ee', textAlign: 'right' }}>{clip(item.link, 40)}</span> : null}
              </div>
              <div style={{ fontSize: '12px', lineHeight: 1.5 }}>{lines(item.description)}</div>
            </div>
          ))}
        </Section>
      ) : null}
    </div>
  );
}

function ClassicTemplate({ resume }) {
  const personal = resume.personalInfo || {};

  return (
    <div style={{ ...shellStyle, fontFamily: '"Times New Roman", serif', padding: '12mm' }}>
      <header style={{ marginBottom: '8mm', textAlign: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 700 }}>{safe(personal.fullName)}</h1>
        <div style={{ marginTop: '5px', fontSize: '11px', color: '#4b5563' }}>
          {[personal.email, personal.phone, personal.location, personal.linkedin].filter(Boolean).map((item) => clip(item, 50)).join(' | ')}
        </div>
      </header>

      {personal.summary ? <Section title="Objective"><p style={{ fontSize: '12px', lineHeight: 1.6 }}>{clip(personal.summary, 300)}</p></Section> : null}

      {(resume.experience || []).length > 0 ? (
        <Section title="Professional Experience">
          {resume.experience.map((item, index) => (
            <div key={index} style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                <strong style={{ fontSize: '13px' }}>{clip(`${safe(item.position)}, ${safe(item.company)}`, 160)}</strong>
                <span style={{ fontSize: '11px' }}>{safe(item.startDate)} - {item.current ? 'Present' : safe(item.endDate)}</span>
              </div>
              <div style={{ marginTop: '3px', fontSize: '12px', lineHeight: 1.5 }}>{lines(item.description)}</div>
            </div>
          ))}
        </Section>
      ) : null}

      {(resume.education || []).length > 0 ? (
        <Section title="Education">
          {resume.education.map((item, index) => (
            <div key={index} style={{ marginBottom: '6px', display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
              <div>
                <strong style={{ fontSize: '13px' }}>{clip(item.school || item.institution, 120)}</strong>
                <div style={{ fontSize: '12px' }}>{clip(`${safe(item.degree)}${item.field ? ` in ${item.field}` : ''}${item.gpa ? ` - GPA ${item.gpa}` : ''}`, 140)}</div>
              </div>
              <span style={{ fontSize: '11px' }}>{safe(item.startYear || item.startDate)} - {safe(item.endYear || item.endDate)}</span>
            </div>
          ))}
        </Section>
      ) : null}
    </div>
  );
}

function MinimalTemplate({ resume }) {
  const personal = resume.personalInfo || {};

  return (
    <div style={{ ...shellStyle, fontFamily: 'Helvetica, Arial, sans-serif', padding: '12mm 14mm' }}>
      <h1 style={{ marginBottom: '4px', fontSize: '30px', fontWeight: 300, letterSpacing: '2px' }}>{safe(personal.fullName)}</h1>
      <div style={{ marginBottom: '10mm', fontSize: '11px', color: '#6b7280' }}>
        {[personal.email, personal.phone, personal.location].filter(Boolean).map((item) => clip(item, 50)).join(' - ')}
      </div>

      {personal.summary ? <Section title="About"><p style={{ fontSize: '12px', lineHeight: 1.7 }}>{clip(personal.summary, 300)}</p></Section> : null}

      {(resume.experience || []).length > 0 ? (
        <Section title="Experience">
          {resume.experience.map((item, index) => (
            <div key={index} style={{ marginBottom: '10px', display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>{safe(item.position)}</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>{clip(item.company, 100)}</div>
                <div style={{ marginTop: '4px', fontSize: '12px', lineHeight: 1.5 }}>{lines(item.description)}</div>
              </div>
              <div style={{ fontSize: '11px', color: '#9ca3af', textAlign: 'right' }}>
                {safe(item.startDate)}<br />{item.current ? 'Present' : safe(item.endDate)}
              </div>
            </div>
          ))}
        </Section>
      ) : null}

      {(resume.skills || []).length > 0 ? (
        <Section title="Skills">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {(resume.skills || []).map((skill, index) => (
              <span key={`${skill}-${index}`} style={{ borderRadius: '999px', background: '#f3f4f6', padding: '3px 10px', fontSize: '11px', color: '#374151' }}>
                {clip(skill, 40)}
              </span>
            ))}
          </div>
        </Section>
      ) : null}
    </div>
  );
}

function CreativeTemplate({ resume }) {
  const personal = resume.personalInfo || {};

  return (
    <div style={{ ...shellStyle, display: 'grid', gridTemplateColumns: '35% 65%', minHeight: '297mm' }}>
      <aside style={{ background: '#111827', color: '#fff', padding: '10mm 7mm' }}>
        <div style={{ marginBottom: '8mm' }}>
          <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: '#4361ee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>
            {(personal.fullName || 'R').charAt(0)}
          </div>
          <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 700, lineHeight: 1.2 }}>{safe(personal.fullName)}</h1>
          {resume.experience?.[0]?.position ? <p style={{ marginTop: '4px', fontSize: '11px', color: '#9ca3af' }}>{clip(resume.experience[0].position, 80)}</p> : null}
        </div>

        <Section title="Contact">
          {[personal.email, personal.phone, personal.location, personal.linkedin, personal.github].filter(Boolean).map((item) => (
            <div key={item} style={{ marginBottom: '4px', fontSize: '11px', color: '#d1d5db' }}>{clip(item, 80)}</div>
          ))}
        </Section>

        {(resume.skills || []).length > 0 ? (
          <Section title="Skills">
            {(resume.skills || []).map((skill, index) => (
              <div key={index} style={{ marginBottom: '2px', fontSize: '11px', color: '#d1d5db' }}>{clip(skill, 40)}</div>
            ))}
          </Section>
        ) : null}
      </aside>

      <main style={{ padding: '10mm 8mm' }}>
        {personal.summary ? <Section title="Profile"><p style={{ fontSize: '12px', lineHeight: 1.7 }}>{clip(personal.summary, 300)}</p></Section> : null}

        {(resume.experience || []).length > 0 ? (
          <Section title="Experience">
            {resume.experience.map((item, index) => (
              <div key={index} style={{ marginBottom: '10px', borderLeft: '2px solid #4361ee', paddingLeft: '10px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700 }}>{safe(item.position)}</div>
                <div style={{ marginBottom: '2px', fontSize: '11px', color: '#4361ee' }}>{clip(`${safe(item.company)}${item.location ? ` - ${item.location}` : ''}`, 120)}</div>
                <div style={{ marginBottom: '4px', fontSize: '10px', color: '#9ca3af' }}>{safe(item.startDate)} - {item.current ? 'Present' : safe(item.endDate)}</div>
                <div style={{ fontSize: '12px', lineHeight: 1.5 }}>{lines(item.description)}</div>
              </div>
            ))}
          </Section>
        ) : null}

        {(resume.projects || []).length > 0 ? (
          <Section title="Projects">
            {resume.projects.map((item, index) => (
              <div key={index} style={{ marginBottom: '8px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700 }}>{clip(item.title || item.name, 100)}</div>
                <div style={{ fontSize: '12px', lineHeight: 1.5 }}>{lines(item.description)}</div>
              </div>
            ))}
          </Section>
        ) : null}
      </main>
    </div>
  );
}

export default function ResumePreview({ resume }) {
  const templates = {
    modern: ModernTemplate,
    classic: ClassicTemplate,
    minimal: MinimalTemplate,
    creative: CreativeTemplate,
  };

  const Template = templates[resume?.template] || ModernTemplate;

  return (
    <div className="overflow-hidden rounded-sm shadow-2xl" style={{ background: '#fff' }}>
      <Template resume={resume || {}} />
    </div>
  );
}
