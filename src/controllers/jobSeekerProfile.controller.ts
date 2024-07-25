import { Request, Response } from 'express';
import { jobSeekerModel } from '../models/jobSeeker.model.js';
import { ZodError } from 'zod';
import { jobSeekerProfileValidation } from '../validation/jobSeekerProfile.Validation.js';

export const jobSeekerProfileCreate = async (req: Request, res: Response) => {
    try {
        const parsedData = jobSeekerProfileValidation.parse(req.body);
        const { user, fullName, resume, skills, education, experience } =
            parsedData;
        const existingProfile = await jobSeekerModel.findOne({ user });
        if (existingProfile) {
            return res
                .status(400)
                .json({ success: false, message: 'Profile already exists' });
        }
        const newProfile = await jobSeekerModel.create({
            user,
            fullName,
            resume,
            skills,
            education,
            experience
        });
        return res.status(201).json({
            success: true,
            profile: newProfile,
            message: 'Profile saved successfully'
        });
    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({
                success: false,
                errors: error.errors.map((e) => e.message)
            });
        }
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to create Profile',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

export const jobSeekerProfileGet = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?._id;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID not found in request.'
            });
        }

        const profile = await jobSeekerModel.findOne({ user: userId });

        if (!profile) {
            return res
                .status(404)
                .json({ success: false, message: 'Profile not found' });
        }
        return res
            .status(200)
            .json({ success: true, profile, message: 'Showing profile' });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to get Profile',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
