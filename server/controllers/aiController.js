import Resume from "../models/Resume.js";
import ai from "../configs/ai.js";

// builds a plain-text summary of a resume document, used as AI input
const resumeToText = (resume) => {
    const lines = [];

    if (resume.personal_info?.profession) {
        lines.push(`Target role / current profession: ${resume.personal_info.profession}`);
    }
    if (resume.professional_summary) {
        lines.push(`Professional summary: ${resume.professional_summary}`);
    }
    if (resume.skills?.length) {
        lines.push(`Skills: ${resume.skills.join(", ")}`);
    }
    if (resume.experience?.length) {
        lines.push("Experience:");
        resume.experience.forEach((exp) => {
            lines.push(`- ${exp.position || ""} at ${exp.company || ""}: ${exp.description || ""}`);
        });
    }
    if (resume.project?.length) {
        lines.push("Projects:");
        resume.project.forEach((proj) => {
            lines.push(`- ${proj.name || ""} (${proj.type || ""}): ${proj.description || ""}`);
        });
    }
    if (resume.education?.length) {
        lines.push("Education:");
        resume.education.forEach((edu) => {
            lines.push(`- ${edu.degree || ""} in ${edu.field || ""} from ${edu.institution || ""}`);
        });
    }

    return lines.join("\n");
}

//controller for enhancing a resume's professional summary 
// POST: /api/ai/enhance-pro-sum 
export const enhanceProfessionalSummary= async (req, res) => {
    try {
        const { userContent } = req.body;

        if(!userContent) {
            return res.status(400).json({message: 'Missing required fields'})
        }

        const response= await ai.chat.completions.create({

            model: process.env.OPENAI_MODEL,
            messages: [
                {   role: "system", 
                    content: "You are an expert in resume writing. Your task is to enhance the professional summary of a resume. The summary should be 1-2 sentences also highlighting key skills, experience, and career objectives. Make it compelling and ATS-friendly. and only return text no options or anything else.",
                    
                },
                {
                    role: "user",
                    content: userContent,
                },
            ],
        })

        const enhancedContent= response.choices[0].message.content;
        return res.status(200).json({enhancedContent})
    } catch (error) {
        return res.status(400).json({message: error.message})

    }
}

//controller for enhancing a resume's job description 
//POST: /api/ai/enhance-job-desc 
export const enhanceJobDescription = async (req, res) => {
    try {
        const { userContent } = req.body;

        if(!userContent) {
            return res.status(400).json({message: 'Missing required fields'})
        }

        const response= await ai.chat.completions.create({

            model: process.env.OPENAI_MODEL,
            messages: [
                {   role: "system", 
                    content: "You are an expert in resume writing. Your task is to enhance the job description of a resume. The job description should be only in 1-2 sentence also highlighting key responsibilities and achievements. Use action verbs and quantifiable results where possible. Make it ATS-friendly. and only return text no options or anything else." 
                },
                {
                    role: "user",
                    content: userContent,
                },
            ],
        })

        const enhancedContent= response.choices[0].message.content;
        return res.status(200).json({enhancedContent})
    } catch (error) {
        return res.status(400).json({message: error.message})

    }
}

//controller for uploading a resume to the database 
// POST: /api/ai/upload-ressume  

export const uploadResume = async (req, res) => {
    try {
       
        const {resumeText, title} = req.body;
        const userId = req.userId;

        if(!resumeText){
            return res.status(400).json({message: 'Missing required fields'})
        }

        const systemPrompt = "You are an expert AI Agent to extract data from resume."

        const userPrompt = `extract data from this resume: ${resumeText}
        
        Provide data in the following JSON format with no additional text before or after:

        {
        professional_summary: { type: String, default: '' },
        skills: [{ type: String }],
        personal_info: {
            image: {type: String, default: '' },
            full_name: {type: String, default: '' },
            profession: {type: String, default: '' },
            email: {type: String, default: '' },
            phone: {type: String, default: '' },
            location: {type: String, default: '' },
            linkedin: {type: String, default: '' },
            website: {type: String, default: '' },
        },
        experience: [
            {
                company: { type: String },
                position: { type: String },
                start_date: { type: String },
                end_date: { type: String },
                description: { type: String },
                is_current: { type: Boolean },
            }
        ],
        project: [
            {
                name: { type: String },
                type: { type: String },
                description: { type: String },
            }
        ],
        education: [
            {
                institution: { type: String },
                degree: { type: String },
                field: { type: String },
                graduation_date: { type: String },
                gpa: { type: String },
            }
        ],          
        }
        `;

       const response = await ai.chat.completions.create({
            model: process.env.OPENAI_MODEL,
            messages: [
                { role: "system",
                 content: systemPrompt },
                {
                    role: "user",
                    content: userPrompt,
                },
        ],
        response_format: {type:  'json_object'}
        })

        const extractedData = response.choices[0].message.content;
        const parsedData = JSON.parse(extractedData)
        const newResume = await Resume.create({userId, title, ...parsedData})

        res.json({resumeId: newResume._id})
    } catch (error) {
        return res.status(400).json({message: error.message})
    }
}

// controller for scoring a resume's match against a pasted job description (ATS-style match)
// POST: /api/ai/match-job
export const matchJobDescription = async (req, res) => {
    try {
        const userId = req.userId;
        const { resumeId, jobDescription } = req.body;

        if (!resumeId || !jobDescription) {
            return res.status(400).json({ message: 'Missing required fields' })
        }

        const resume = await Resume.findOne({ userId, _id: resumeId })
        if (!resume) {
            return res.status(404).json({ message: "Resume not found" })
        }

        const resumeText = resumeToText(resume);

        const systemPrompt = "You are an expert ATS (Applicant Tracking System) and technical recruiter. Compare the given resume against the given job description. Identify important keywords, skills and requirements from the job description, and determine which are present in the resume and which are missing. Be strict but fair - only count a keyword as matched if it genuinely appears or is clearly implied in the resume.";

        const userPrompt = `Job description:\n${jobDescription}\n\nResume:\n${resumeText}\n\nRespond with ONLY a JSON object in this exact format, no extra text:\n{\n  "matchScore": <integer 0-100, overall match percentage>,\n  "matchedKeywords": [<important keywords/skills from the job description found in the resume>],\n  "missingKeywords": [<important keywords/skills from the job description missing from the resume>],\n  "suggestions": [<3-5 short, specific, actionable suggestions to improve the resume's match for this job>]\n}`;

        const response = await ai.chat.completions.create({
            model: process.env.OPENAI_MODEL,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
            ],
            response_format: { type: 'json_object' }
        })

        const rawContent = response.choices[0].message.content;
        const result = JSON.parse(rawContent);

        // guard against a malformed AI response so the frontend never crashes on this
        const safeResult = {
            matchScore: Number.isFinite(result.matchScore) ? Math.max(0, Math.min(100, Math.round(result.matchScore))) : 0,
            matchedKeywords: Array.isArray(result.matchedKeywords) ? result.matchedKeywords : [],
            missingKeywords: Array.isArray(result.missingKeywords) ? result.missingKeywords : [],
            suggestions: Array.isArray(result.suggestions) ? result.suggestions : [],
        };

        return res.status(200).json(safeResult)
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}