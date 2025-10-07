
import type { ProtectedAttribute } from './types';

export const DEFAULT_DATASETS = [
    {
        name: 'Loan Application Model',
        description: "A model that predicts loan approval based on income, credit score, age, and employment history."
    },
    {
        name: 'Hiring Algorithm Data',
        description: "A dataset used to train an algorithm for screening job applicants based on resume keywords, education, and past experience."
    },
    {
        name: 'Criminal Recidivism Prediction',
        description: "A model that predicts the likelihood of a defendant re-offending, used for sentencing and parole decisions."
    },
    {
        name: 'Predictive Health Diagnostics',
        description: "A model used to predict patient disease risk based on medical history, lifestyle, and demographic data."
    },
    {
        name: 'Automated Content Moderation',
        description: "An AI system designed to automatically detect hate speech on a social media platform from user comments."
    },
    {
        name: 'University Admissions Algorithm',
        description: "An algorithm that scores university applicants based on grades, test scores, and extracurriculars to assist admissions officers."
    }
];

export const PROTECTED_ATTRIBUTES: ProtectedAttribute[] = [
    'Gender',
    'Race',
    'Age',
    'Religion',
    'Disability',
    'Sexual Orientation'
];