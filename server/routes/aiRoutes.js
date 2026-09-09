import express from "express";
import protect from "../middlewares/authMiddleware.js";
import { enhanceJobDescription, enhanceProfessionalSummary, matchJobDescription, uploadResume } from "../controllers/aiController.js";


const aiRouter= express.Router();

aiRouter.post('/enhance-pro-sum', protect, enhanceProfessionalSummary)
aiRouter.post('/enhance-job-desc', protect, enhanceJobDescription)
aiRouter.post('/upload-resume', protect, uploadResume)
aiRouter.post('/match-job', protect, matchJobDescription)

export default aiRouter