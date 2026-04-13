/**
 * Resume Parser Service
 * =====================
 * Extracts skills, experience, and projects from PDF resumes.
 * Uses pdf-parse for text extraction + pattern matching + optional OpenAI.
 */

const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');

// Known skills to scan for
const SKILL_KEYWORDS = [
  'javascript','typescript','python','java','go','rust','c++','c#','ruby','php','swift','kotlin','dart',
  'react','vue','angular','next.js','svelte','nuxt',
  'node.js','express','fastapi','django','flask','spring','rails','laravel',
  'pytorch','tensorflow','sklearn','scikit-learn','huggingface','langchain','openai',
  'postgresql','mysql','mongodb','redis','elasticsearch','cassandra','dynamodb',
  'aws','gcp','azure','docker','kubernetes','terraform','linux','nginx',
  'react native','flutter','android','ios',
  'git','github','graphql','rest','grpc','websockets',
  'figma','sketch','adobe xd',
  'sql','pandas','numpy','spark','kafka','dbt','airflow',
  'solidity','web3','ethereum',
  'html','css','tailwind','sass','webpack','vite',
];

const EXP_PATTERNS = [
  /(\d+)\+?\s*years?\s*(?:of\s*)?experience/gi,
  /experience[:\s]+(\d+)\+?\s*years?/gi,
  /(\d+)\+?\s*years?\s*(?:in|of|working)/gi,
];

const COMPANY_PATTERNS = [
  /(?:at|@|with|for)\s+([A-Z][a-zA-Z\s&.,]+(?:Inc|LLC|Ltd|Corp|Technologies|Solutions|Labs|AI)?)/g,
  /([A-Z][a-zA-Z\s]+)\s*[|\-–]\s*(?:Software|Engineer|Developer|Designer|Analyst|Manager)/g,
];

/**
 * Extract skills from raw text using keyword matching + fuzzy proximity.
 */
function extractSkills(text) {
  const lower = text.toLowerCase();
  const found = new Set();

  SKILL_KEYWORDS.forEach(skill => {
    // Exact match
    if (lower.includes(skill)) {
      found.add(skill.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
    }
  });

  // Detect capitalized tech names (e.g., "React", "AWS", "PostgreSQL")
  const techPattern = /\b([A-Z][a-zA-Z]*(?:\.[a-zA-Z]+)?)\b/g;
  let match;
  while ((match = techPattern.exec(text)) !== null) {
    const word = match[1];
    if (word.length >= 3 && SKILL_KEYWORDS.some(s => s.toLowerCase() === word.toLowerCase())) {
      found.add(word);
    }
  }

  return [...found].slice(0, 20);
}

/**
 * Extract years of experience.
 */
function extractExperience(text) {
  for (const pattern of EXP_PATTERNS) {
    const match = pattern.exec(text);
    if (match) {
      const years = parseInt(match[1]);
      if (years >= 1 && years <= 30) {
        const level = years <= 1 ? 'Beginner' : years <= 4 ? 'Intermediate' : 'Advanced';
        return `${years}+ years of experience (${level})`;
      }
    }
  }

  // Fallback: count date ranges like "2019 - 2023"
  const dateRanges = text.match(/\b(20\d{2})\s*[-–]\s*(20\d{2}|present|current)\b/gi) || [];
  if (dateRanges.length >= 2) return 'Multiple roles detected — Intermediate to Advanced';
  if (dateRanges.length === 1) return '1-2 years estimated — Beginner to Intermediate';
  return 'Experience level could not be determined';
}

/**
 * Extract project names from resume text.
 */
function extractProjects(text) {
  const projects = [];

  // Look for project headers
  const projectSection = text.match(/(?:projects?|portfolio|work|personal projects?)[:\s\n]+([\s\S]{0,800}?)(?:\n\n|\neducation|\nskills|\nexperience|$)/i);
  if (projectSection) {
    const lines = projectSection[1].split('\n').map(l => l.trim()).filter(l => l.length > 5 && l.length < 100);
    lines.slice(0, 5).forEach(line => {
      if (!/^\d+$/.test(line) && !/^[•\-\*]$/.test(line)) {
        projects.push(line.replace(/^[•\-\*\d.]\s*/, '').trim());
      }
    });
  }

  return projects.filter(Boolean).slice(0, 5);
}

/**
 * Main parse function — takes a file path, returns structured data.
 */
async function parseResume(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    const text = data.text;

    if (!text || text.trim().length < 50) {
      return {
        success: false,
        error: 'Could not extract readable text from PDF',
        extractedSkills: [],
        extractedExperience: '',
        extractedProjects: [],
      };
    }

    const extractedSkills = extractSkills(text);
    const extractedExperience = extractExperience(text);
    const extractedProjects = extractProjects(text);

    return {
      success: true,
      extractedSkills,
      extractedExperience,
      extractedProjects,
      charCount: text.length,
      parsedAt: new Date(),
    };
  } catch (err) {
    console.error('Resume parse error:', err.message);
    return {
      success: false,
      error: err.message,
      extractedSkills: [],
      extractedExperience: '',
      extractedProjects: [],
    };
  }
}

module.exports = { parseResume };
