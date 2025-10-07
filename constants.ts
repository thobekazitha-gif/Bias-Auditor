
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
];

export const PROTECTED_ATTRIBUTES: ProtectedAttribute[] = [
    'Gender',
    'Race',
    'Age',
    'Religion',
    'Disability',
    'Sexual Orientation'
];
